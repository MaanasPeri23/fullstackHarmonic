from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List 
#imported


from backend.db import database

router = APIRouter(
    prefix="/companies",
    tags=["companies"],
)


class CompanyOutput(BaseModel):
    id: int
    company_name: str
    liked: bool


class CompanyBatchOutput(BaseModel):
    companies: list[CompanyOutput]
    total: int


def fetch_companies_with_liked(db: Session, company_ids: list[int]) -> list[CompanyOutput]:
    liked_list = (
        db.query(database.CompanyCollection)
        .filter(database.CompanyCollection.collection_name == "Liked Companies")
        .first()
    )

    liked_associations = (
        db.query(database.CompanyCollectionAssociation)
        .filter(database.Company.id.in_(company_ids))
        .filter(
            database.CompanyCollectionAssociation.collection_id == liked_list.id,
        )
        .all()
    )

    liked_companies = {association.company_id for association in liked_associations}

    companies = (
        db.query(database.Company).filter(database.Company.id.in_(company_ids)).all()
    )

    results = [(company, company.id in liked_companies) for company in companies]

    return [
        CompanyOutput(
            id=company.id,
            company_name=company.company_name,
            liked=True if liked else False,
        )
        for company, liked in results
    ]


@router.get("", response_model=CompanyBatchOutput)
def get_companies(
    offset: int = Query(
        0, description="The number of items to skip from the beginning"
    ),
    limit: int = Query(10, description="The number of items to fetch"),
    db: Session = Depends(database.get_db),
):
    results = db.query(database.Company).offset(offset).limit(limit).all()

    count = db.query(database.Company).count()
    companies = fetch_companies_with_liked(db, [company.id for company in results])

    return CompanyBatchOutput(
        companies=companies,
        total=count,
    )

# made post request to like a company 
@router.post("/{company_id}/like")
def like_company(
    company_id: int,
    db: Session = Depends(database.get_db),
):
    liked_list = (
        db.query(database.CompanyCollection)
        .filter(database.CompanyCollection.collection_name == "Liked Companies")
        .first()
    )

    association = database.CompanyCollectionAssociation(
        company_id=company_id,
        collection_id=liked_list.id
    )
    db.add(association)
    db.commit()

    return {"status": "success"} #confirming when the db adds the current company to the liked list

class BulkLikeInput(BaseModel):
    company_ids: List[int]

@router.post("/bulk-like")
def bulk_like_companies(
    input: BulkLikeInput,
    db: Session = Depends(database.get_db), 
):
    liked_list = (
        db.query(database.CompanyCollection)
        .filter(database.CompanyCollection.collection_name == "Liked Companies")
        .first()
    )

    #checking agains the initial liked list to make sure we don't add companies already in the "liked companies" list
    existing_associations = set(
        db.query(database.CompanyCollectionAssociation.company_id)
        .filter(
            database.CompanyCollectionAssociation.collection_id == liked_list.id, #Liked Companies collection
            database.CompanyCollectionAssociation.company_id.in_(input.company_ids) #companies to be added by user
        ).all()
    )

    # adding only new companies not in that previous list
    new_associations = [
        database.CompanyCollectionAssociation(company_id=company_id, collection_id=liked_list.id)
        for company_id in input.company_ids
        if (company_id,) not in existing_associations
    ]


    db.bulk_save_objects(new_associations) #single operation
    db.commit()

    return {"status": "success", "added_count": len(new_associations)}


@router.post("/reset-liked-companies")
def reset_liked_companies(db: Session = Depends(database.get_db)):
    try:
        liked_list = (
            db.query(database.CompanyCollection)
            .filter(database.CompanyCollection.collection_name == "Liked Companies")
            .first()
        )

        #delete all existing liked companies
        db.query(database.CompanyCollectionAssociation).filter(
            database.CompanyCollectionAssociation.collection_id == liked_list.id
        ).delete()

        #get first 10 oriignally liked companies
        first_10_companies = db.query(database.Company).limit(10).all()

        #new associations of these 10 created.
        new_associations = [
            database.CompanyCollectionAssociation(company_id=company.id, collection_id=liked_list.id)
            for company in first_10_companies
        ]

        db.bulk_save_objects(new_associations)
        db.commit()
        
        print("exited")

        return {"status": "success", "message": "Reset done"}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    

#modified version of above bulk-like function, I previously only passed in the current rows in the screen to the liked collection. but here I iterate through all 50000 companies in batches of 1000
@router.post("/bulk-like-all")
async def bulk_like_all(input: BulkLikeInput, db: Session = Depends(database.get_db)):
    liked_list = (
        db.query(database.CompanyCollection)
        .filter(database.CompanyCollection.collection_name == "Liked Companies")
        .first()
    ) 

    total_companies = len(input.company_ids)
    processed_companies = 0

    #we are going to be processing all 50000 companies in batches here
    batch_size = 1000
    for i in range(0, total_companies, batch_size):
        batch = input.company_ids[i:i+batch_size]
        
        existing_associations = set(
            db.query(database.CompanyCollectionAssociation.company_id)
            .filter(
                database.CompanyCollectionAssociation.collection_id == liked_list.id,
                database.CompanyCollectionAssociation.company_id.in_(batch)
            ).all()
        )

        new_associations = [
            database.CompanyCollectionAssociation(company_id=company_id, collection_id=liked_list.id)
            for company_id in batch
            if (company_id,) not in existing_associations
        ]

        db.bulk_save_objects(new_associations)
        db.commit()

        processed_companies += len(batch) #needed this for debugging
        print(f"Processed {processed_companies}/{total_companies}")
        