import { defineStore } from 'pinia';
import api from '../api/axios';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
    }),
    actions: {
        async login(email, password) {
            const res = await api.post('auth/login', { email, password });
            this.token = res.data.token;
            this.user = { username: res.data.username, role: res.data.role };
            localStorage.setItem('token', this.token);
        },

        async register(username, email, password) {
            await api.post('auth/register', { username, email, password });
        },

        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
        }
    }
})