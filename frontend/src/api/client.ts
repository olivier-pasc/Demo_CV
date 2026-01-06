import axios from 'axios';

// In production, this should be an environment variable
const BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const uploadCV = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/candidates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const createJob = async (job: any) => {
    const response = await api.post('/jobs/', job);
    return response.data;
};

export const getJobs = async () => {
    const response = await api.get('/jobs/');
    return response.data;
};

export const getMatches = async (jobId: string) => {
    const response = await api.post(`/matches/match/${jobId}`);
    return response.data;
};
