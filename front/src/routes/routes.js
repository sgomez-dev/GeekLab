import LoginPage from '../pages/LoginPage.svelte';
import RegisterPage from '../pages/RegisterPage.svelte';
import ProductsPage from '../pages/ProductsPage.svelte';
import ProductDetailPage from '../pages/ProductDetailPage.svelte';
import ProductFormPage from '../pages/ProductFormPage.svelte';
import UserProfilePage from '../pages/UserProfilePage.svelte';
import AdminUsersPage from '../pages/AdminUsersPage.svelte';
import AdminOrdersPage from '../pages/AdminOrdersPage.svelte';
import ForumPage from '../pages/ForumPage.svelte';
import NotFoundPage from '../pages/NotFoundPage.svelte';

import { get } from 'svelte/store';
import { tokenStore, userStore } from '../state/appStore.js';
import { wrap } from 'svelte-spa-router/wrap';

const requireAuth = () => !!get(tokenStore);

const requireAdmin = () => get(userStore)?.role === 'admin';

export const routes = {
  '/': wrap({ component: ProductsPage, conditions: [requireAuth] }),
  '/login': LoginPage,
  '/register': RegisterPage,

  // Auth required
  '/products': wrap({ component: ProductsPage, conditions: [requireAuth] }),
  '/products/create': wrap({ component: ProductFormPage, conditions: [requireAdmin] }),
  '/products/:id/edit': wrap({ component: ProductFormPage, conditions: [requireAdmin] }),
  '/products/:id': wrap({ component: ProductDetailPage, conditions: [requireAuth] }),
  '/account': wrap({ component: UserProfilePage, conditions: [requireAuth] }),
  '/forum': wrap({ component: ForumPage, conditions: [requireAuth] }),

  // Admin required
  '/admin/users': wrap({ component: AdminUsersPage, conditions: [requireAdmin] }),
  '/admin/orders': wrap({ component: AdminOrdersPage, conditions: [requireAdmin] }),

  '*': NotFoundPage,
};

