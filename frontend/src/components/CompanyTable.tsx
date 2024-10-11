import { DataGrid, GridRowSelectionModel, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getCollectionsById, ICompany, likeCompany, bulkLikeCompanies, resetLikedCompanies, getAllCompanyIds, bulkLikeCompaniesAll} from "../utils/jam-api";
import LinearProgress from '@mui/material/LinearProgress';

const CompanyTable = (props: { selectedCollectionId: string }) => {
  const [response, setResponse] = useState<ICompany[]>([]);
  const [total, setTotal] = useState<number>();
  const [offset, setOffset] = useState<number>(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]); //currently selected rows
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    getCollectionsById(props.selectedCollectionId, offset, pageSize).then(
      (newResponse) => {
        setResponse(newResponse.companies);
        setTotal(newResponse.total);
      }
    );
  }, [props.selectedCollectionId, offset, pageSize]);

  useEffect(() => {
    setOffset(0);
  }, [props.selectedCollectionId]);

  //have a like button
  const handleLike = async (companyID: number) => {
    try {
      await likeCompany(companyID); //TODO: implement
      //refresh the data after liking 
      const newResponse = await getCollectionsById(props.selectedCollectionId, offset, pageSize);
      setResponse(newResponse.companies);
    } catch (error) {
      console.error("Error liking company", error); 
    }
  }

  //like button at the top, collection array of ids to add to liked companies collection
  const handleBulkLike = async (ids?: number[]) => {
    try {
      const companyIds = ids || (selectionModel as number[]); 
      await bulkLikeCompanies(companyIds);
      //refresh  after bulk liking 
      const newResponse = await getCollectionsById(props.selectedCollectionId, offset, pageSize);
      setResponse(newResponse.companies);
      setSelectionModel([]); //clear entire selection after bulk liking
    } catch (error) {
      console.error("Error bulk liking companies", error); 
    }
  }

  const handleBulkLikeAll = async (ids?: number[]) => {
    setIsLoading(true);
    setProgress(0);
    try {
      //need to first get ALL the company ids if the user didn't select anything which means they want to add everything
      let companyIds;
      if (ids) {
        companyIds = ids;
      } else if (selectionModel.length > 0) {
        companyIds = selectionModel as number[];
      } else {
        // If no selection and no ids provided, get all company ids
        companyIds = await getAllCompanyIds(props.selectedCollectionId);
      }
      //needed to batch these companies to show a progress bar, redundant code here
      const totalCompanies = companyIds.length;
      const batchSize = 1000;

      for (let i = 0; i < totalCompanies; i += batchSize) {
        const batch = companyIds.slice(i, i + batchSize);
        await bulkLikeCompaniesAll(batch);
        setProgress(Math.min(100, ((i + batchSize) / totalCompanies) * 100));
      }

      // Refresh the data after bulk liking
      const newResponse = await getCollectionsById(props.selectedCollectionId, offset, pageSize);
      setResponse(newResponse.companies);
      setSelectionModel([]);
    } catch (error) {
      console.error("Error bulk liking companies", error);
    } finally { //new thing I learned, finally block always runs no matter what
      setIsLoading(false);
      setProgress(0);
    }
  }

  const handleResetLikedCompanies = async () => {
    try {
      await resetLikedCompanies();
      const newResponse = await getCollectionsById(props.selectedCollectionId, offset, pageSize);
      setResponse(newResponse.companies);
      setSelectionModel([]);
    } catch (error) {
      console.error("Error resetting liked companies", error);
    }
  }  


  const columns: GridColDef[] = [
    { field: "liked", headerName: "Liked", width: 90 },
    { field: "id", headerName: "ID", width: 90 },
    { field: "company_name", headerName: "Company Name", width: 200 },
    // {
    //   field: "action",
    //   headerName: "Action",
    //   width: 120,
    //   renderCell: (params) => (
    //     <button onClick={() => handleLike(params.row.id)} disabled={params.row.liked}>
    //       {params.row.liked ? "Liked" : "Like"}
    //     </button>
    //   ),
    // }
  ]

  //wrapping the handleBulkLike function in arrow function to accept MouseEvent. 
  return (
    <div>
      <button 
        onClick={() => handleBulkLike()} 
        disabled={selectionModel.length === 0}
      >
        Add Selected to Liked Companies
      </button>
      {/* <button onClick={() => handleBulkLike(response.map(company => company.id))}>
        Add All to Liked Companies
      </button> */}
      <button 
        onClick={() => handleBulkLikeAll()} 
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Add All to Liked Companies'}
      </button>

      {isLoading && (
        <div>
          <LinearProgress variant="determinate" value={progress} />
          <p>{`${Math.round(progress)}% complete`}</p>
        </div>
      )}


      <button onClick={ () => handleResetLikedCompanies()}>
        Reset Liked Companies
      </button>

      <div style={{ height: 800, width: "100%" }}>
        <DataGrid
          rows={response}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={(newSelectionModel) => {
            setSelectionModel(newSelectionModel);
          }}
          rowSelectionModel={selectionModel}
          rowHeight={30}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          rowCount={total}
          pagination
          paginationMode="server"
          onPaginationModelChange={(newMeta) => {
            setPageSize(newMeta.pageSize);
            setOffset(newMeta.page * newMeta.pageSize);
          }}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default CompanyTable;
