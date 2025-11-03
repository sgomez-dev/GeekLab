import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import ProductsView from '@/views/ProductsView.vue';
import ChatView from '@/views/ChatView.vue';

const routes = [
    { path: '/', redirect: '/products' },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/products', component: ProductsView },
    { path: '/chat', component: ChatView },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});