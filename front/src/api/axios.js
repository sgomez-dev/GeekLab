import axios from 'axios';

const BACKEND_URL = 'https://geeklab-back.sgomez.dev';

const api = axios.create({
    baseURL: 'https://geeklab-back.sgomez.dev/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;