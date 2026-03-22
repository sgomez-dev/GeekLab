<script>
  import { setContext } from 'svelte';
  import Router, { link, push } from 'svelte-spa-router';
  import { routes } from './routes/routes.js';
  import Navbar from './components/Navbar.svelte';
  import ToastContainer from './components/ToastContainer.svelte';
  import { setAuthToken } from './services/api';
  import { appActionsKey } from './state/appContext.js';
  import {
    productsStore,
    tokenStore,
    userStore,
  } from './state/appStore.js';

  // Estado global (Svelte 5 runes)
  const initialToken = (() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  })();

  const initialUser = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  let token = $state(initialToken);
  let user = $state(initialUser);
  let products = $state([]);

  const role = $derived(user?.role ?? null);
  const isAdmin = $derived(role === 'admin');
  const filteredProducts = $derived(products);

  function applyLogin(nextToken, nextUser) {
    token = nextToken;
    user = nextUser;
    tokenStore.set(nextToken);
    userStore.set(nextUser);

    // Persistencia de sesión (bonus): restaurar tras recargar la página.
    try {
      if (nextToken) localStorage.setItem('token', nextToken);
      if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
    } catch {
      // ignore (private mode / blocked storage)
    }
  }

  function logout() {
    token = null;
    user = null;
    products = [];
    tokenStore.set(null);
    userStore.set(null);
    productsStore.set([]);

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
  }

  function setProducts(nextProducts) {
    products = Array.isArray(nextProducts) ? nextProducts : [];
    productsStore.set(products);
  }

  setContext(appActionsKey, { applyLogin, logout, setProducts });

  // Side effects: sincronizar token con la capa de API y redirigir si se pierde auth.
  $effect(() => {
    setAuthToken(token);
    tokenStore.set(token);
    userStore.set(user);
    productsStore.set(products);

    if (!token) {
      const hash = window.location.hash || '';
      const path = hash.startsWith('#/') ? hash.slice(1) : hash.replace(/^#/, '');
      const isProtected =
        path === '/products' ||
        path.startsWith('/products/') ||
        path === '/account' ||
        path.startsWith('/admin') ||
        path.startsWith('/forum');

      if (isProtected) push('/login');
    }
  });
</script>

<div class="app">
  <Navbar />
  <main class="main">
    <Router
      {routes}
      onConditionsFailed={(detail) => {
        const loc = detail.location || '';
        const isAdminRoute =
          loc.startsWith('/admin') ||
          loc.includes('/products/create') ||
          loc.includes('/products/') && loc.includes('/edit');

        push(isAdminRoute ? '/products' : '/login');
      }}
    />
  </main>
  <ToastContainer />
  <footer class="footer">
    <span>GeekLab</span>
    {#if user}
      <a href="/products" use:link>Catálogo</a>
    {:else}
      <a href="/login" use:link>Login</a>
    {/if}
    {#if isAdmin}
      <span class="admin-pill">Admin</span>
    {/if}
  </footer>
</div>

<style>
  .app {
    min-height: 100vh;
    background: #ffffff;
    color: var(--secondary-color);
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
    padding-top: 72px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
  }

  .footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 14px;
    align-items: center;
    color: var(--secondary-color);
  }

  .footer :global(a) {
    color: var(--primary-color);
    text-decoration: none;
  }

  .footer :global(a:hover) {
    text-decoration: underline;
  }
</style>

