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

// Auto logout on auth errors
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        const message = (err?.response?.data?.message || '').toLowerCase();
        if (status === 401 && message.includes('token expired')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        } else if (status === 403 && message.includes('invalid token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    }
);

export default api;