<script>
  import { getContext } from 'svelte';
  import { link, push } from 'svelte-spa-router';
  import CartModal from './CartModal.svelte';
  import { initCart, itemCount } from '../state/cartStore.js';
  import { userStore } from '../state/appStore.js';
  import { appActionsKey } from '../state/appContext.js';

  const { logout } = getContext(appActionsKey);

  const nav = [
    { href: '/products', label: 'Productos' },
    { href: '/forum', label: 'Foro' },
    { href: '/account', label: 'Mi cuenta' },
  ];

  let cartOpen = $state(false);
  let currentPath = $state('/');

  $effect(() => {
    initCart($userStore?.id ?? null);
  });

  $effect(() => {
    const computePath = () => {
      const hash = window.location.hash || '';
      const path = hash.startsWith('#/') ? hash.slice(1) : hash.replace(/^#/, '');
      return path || '/';
    };

    const update = () => {
      currentPath = computePath();
    };

    update();
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);

    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('popstate', update);
    };
  });
</script>

<nav class="navbar">
  <div class="brand">
    <a href="/products" class="brand-link" use:link>
      <span class="logo-mark" aria-hidden="true">G</span>
      <span class="brand-name">GeekLab</span>
    </a>
  </div>

  <div class="links">
    {#if !$userStore}
      <a href="/login" class="nav-link" class:active={currentPath === '/login'} use:link>
        Login
      </a>
    {:else}
      {#each nav as item}
        <a
          href={item.href}
          class="nav-link"
          class:active={
            currentPath === item.href ||
            (item.href === '/products' && currentPath.startsWith('/products')) ||
            (item.href === '/forum' && currentPath.startsWith('/forum'))
          }
          use:link
        >
          {item.label}
        </a>
      {/each}
      <button
        class="nav-link nav-btn"
        type="button"
        onclick={() => {
          logout();
          push('/login');
        }}
      >
        Salir
      </button>
      <button class="cart-btn" type="button" onclick={() => (cartOpen = true)}>
        Carrito
        {#if $itemCount > 0}
          <span class="badge">{$itemCount}</span>
        {/if}
      </button>
    {/if}
  </div>
</nav>

<CartModal open={cartOpen} onClose={() => (cartOpen = false)} />

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(224, 224, 224, 0.8);
  }

  .brand-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--secondary-color);
    font-weight: 700;
  }

  .logo-mark {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: rgba(66, 71, 193, 0.12);
    color: var(--primary-color);
    font-size: 1.05rem;
  }

  .brand-name {
    font-size: 1rem;
    letter-spacing: 0.2px;
  }

  .links {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    padding: 9px 12px;
    border-radius: 10px;
    color: var(--secondary-color);
    font-weight: 600;
    transition: background 0.15s ease, transform 0.15s ease;
  }

  .nav-link:hover {
    background: rgba(66, 71, 193, 0.08);
    transform: translateY(-1px);
  }

  .nav-btn {
    border: none;
    background: transparent;
    font: inherit;
    cursor: pointer;
  }

  :global(.active) {
    background: rgba(66, 71, 193, 0.12);
    color: var(--primary-color);
  }

  .cart-btn {
    border: none;
    background: rgba(28, 28, 41, 0.06);
    border: 1px solid rgba(28, 28, 41, 0.14);
    color: var(--secondary-color);
    padding: 9px 12px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .badge {
    min-width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(66, 71, 193, 0.16);
    border: 1px solid rgba(66, 71, 193, 0.22);
    font-weight: 900;
    font-size: 0.85rem;
  }
</style>

