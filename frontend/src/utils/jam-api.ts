import axios from 'axios';

export interface ICompany {
    id: number;
    company_name: string;
    liked: boolean;
}

export interface ICollection {
    id: string;
    collection_name: string;
    companies: ICompany[];
    total: number;
}

export interface ICompanyBatchResponse {
    companies: ICompany[];
}

const BASE_URL = 'http://localhost:8000';

export async function getCompanies(offset?: number, limit?: number): Promise<ICompanyBatchResponse> {
    try {
        const response = await axios.get(`${BASE_URL}/companies`, {
            params: {
                offset,
                limit,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
}

export async function getCollectionsById(id: string, offset?: number, limit?: number): Promise<ICollection> {
    try {
        const response = await axios.get(`${BASE_URL}/collections/${id}`, {
            params: {
                offset,
                limit,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
}

export async function getCollectionsMetadata(): Promise<ICollection[]> {
    try {
        const response = await axios.get(`${BASE_URL}/collections`);
        return response.data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
}

//calling from companies.py
//ignore this function, we are using bulkLike function only
export async function likeCompany(companyId: number): Promise<void> {
    try {
        await axios.post(`${BASE_URL}/companies/${companyId}/like`);
    } catch (error) {
        console.error('Error liking company:', error);
        throw error;
    }
}

export async function bulkLikeCompanies(companyIds: number[]): Promise<void> {
    try {
        await axios.post(`${BASE_URL}/companies/bulk-like`, { company_ids: companyIds });
    } catch (error) {
        console.error('Error bulk liking companies:', error);
        throw error;
    }
}

export async function bulkLikeCompaniesAll(companyIds: number[]): Promise<void> {
    try {
        await axios.post(`${BASE_URL}/companies/bulk-like-all`, { company_ids: companyIds });
    } catch (error) {
        console.error('Error bulk liking companies:', error);
        throw error;
    }
}
export async function getAllCompanyIds(collectionId: string): Promise<number[]> {
    try {
      const response = await axios.get(`${BASE_URL}/collections/${collectionId}/all-ids`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all company IDs:', error);
      throw error;
    }
}

export async function resetLikedCompanies(): Promise<void> {
    try {
        await axios.post(`${BASE_URL}/companies/reset-liked-companies`);
    } catch (error) {
        console.error('Error resetting liked companies:', error);
        throw error;
    }
}


