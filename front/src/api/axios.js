import axios from 'axios';

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // Default to localhost for development
  return 'http://localhost:4000';
};

const BACKEND_URL = getBackendUrl().replace(/\/$/, '');

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;