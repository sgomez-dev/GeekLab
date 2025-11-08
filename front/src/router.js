import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import ProductsView from './views/ProductsView.vue';
import ForumView from './views/ForumView.vue'; 
import CreateProduct from './views/CreateProduct.vue';
import ProductDetailView from './views/ProductDetailView.vue';
import UserProfileView from './views/UserProfileView.vue';
import NotFoundView from './views/NotFoundView.vue';
import { useUserStore } from './stores/userStore';

const routes = [
    { path: '/', redirect: '/products' },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/products', component: ProductsView, meta: { requiresAuth: true } },
    { path: '/products/create', component: CreateProduct, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/products/:id/edit', component: CreateProduct, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/products/:id', component: ProductDetailView, meta: { requiresAuth: true } },
    { path: '/forum', component: ForumView, meta: { requiresAuth: true } },
    { path: '/account', component: UserProfileView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Export a function to set up the navigation guard after Pinia is initialized
export function setupRouterGuard() {
    router.beforeEach((to, from, next) => {
        const userStore = useUserStore();
        const requiresAuth = to.meta.requiresAuth;

        if (requiresAuth && !userStore.token)
            return next({ path: '/login' });

        // protect admin-only routes
        if (to.meta.requiresAdmin && userStore.user?.role !== 'admin')
            return next({ path: '/products' });

        if ((to.path === '/login' || to.path === '/register') && userStore.token) 
            return next({ path: '/products' });

        next();
    });
}

export default router;