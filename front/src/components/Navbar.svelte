<script>
  import { getContext } from 'svelte';
  import { link, push } from 'svelte-spa-router';
  import CartModal from './CartModal.svelte';
  import { initCart, itemCount } from '../state/cartStore.js';
  import { userStore, isAdminStore } from '../state/appStore.js';
  import { appActionsKey } from '../state/appContext.js';

  const { logout } = getContext(appActionsKey);

  const nav = [
    { href: '/products', label: 'Productos' },
    { href: '/forum', label: 'Foro' },
    { href: '/account', label: 'Mi cuenta' },
  ];

  const adminNav = [
    { href: '/admin/users', label: 'Usuarios' },
    { href: '/admin/orders', label: 'Pedidos' },
  ];

  let cartOpen = $state(false);
  let menuOpen = $state(false);
  let currentPath = $state('/');

  function closeMenu() {
    menuOpen = false;
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

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

  $effect(() => {
    currentPath;
    closeMenu();
  });

  $effect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 769px)');
    const onChange = () => {
      if (mq.matches) closeMenu();
    };
    mq.addEventListener('change', onChange);
    onChange();
    return () => mq.removeEventListener('change', onChange);
  });
</script>

<nav class="navbar" aria-label="Principal">
  <div class="brand">
    <a href="/products" class="brand-link" use:link>
      <span class="logo-mark" aria-hidden="true">G</span>
      <span class="brand-name">GeekLab</span>
    </a>
  </div>

  <button
    class="hamburger"
    type="button"
    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
    aria-expanded={menuOpen}
    aria-controls="main-nav"
    onclick={toggleMenu}
  >
    <span class="hamburger-lines" class:open={menuOpen}>
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </span>
  </button>

  <div id="main-nav" class="links" class:menu-open={menuOpen}>
    {#if !$userStore}
      <a
        href="/login"
        class="nav-link"
        class:active={currentPath === '/login'}
        use:link
        onclick={closeMenu}
      >
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
          onclick={closeMenu}
        >
          {item.label}
        </a>
      {/each}
      {#if $isAdminStore}
        {#each adminNav as item}
          <a
            href={item.href}
            class="nav-link nav-admin"
            class:active={currentPath === item.href || currentPath.startsWith(`${item.href}/`)}
            use:link
            onclick={closeMenu}
          >
            {item.label}
          </a>
        {/each}
      {/if}
      <button
        class="nav-link nav-btn"
        type="button"
        onclick={() => {
          closeMenu();
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

{#if menuOpen}
  <button type="button" class="nav-backdrop" aria-label="Cerrar menú" onclick={closeMenu}></button>
{/if}

<CartModal open={cartOpen} onClose={() => (cartOpen = false)} />

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1100;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    gap: 12px;
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

  .hamburger {
    display: none;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    margin: 0 -6px 0 auto;
    padding: 0;
    border: none;
    border-radius: 12px;
    background: rgba(28, 28, 41, 0.06);
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  .hamburger:hover {
    background: rgba(66, 71, 193, 0.1);
  }

  .hamburger:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .hamburger-lines {
    width: 22px;
    height: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hamburger-lines .bar {
    display: block;
    height: 2px;
    width: 100%;
    border-radius: 2px;
    background: var(--secondary-color);
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
    transform-origin: center;
  }

  .hamburger-lines.open .bar:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }

  .hamburger-lines.open .bar:nth-child(2) {
    opacity: 0;
  }

  .hamburger-lines.open .bar:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
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

  .nav-backdrop {
    display: none;
  }

  @media (max-width: 768px) {
    .hamburger {
      display: inline-flex;
    }

    .links {
      display: none;
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
      padding: 12px 18px 20px;
      margin: 0;
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(224, 224, 224, 0.9);
      box-shadow: 0 12px 32px rgba(28, 28, 41, 0.08);
      z-index: 1101;
    }

    .links.menu-open {
      display: flex;
    }

    .nav-link,
    .cart-btn {
      justify-content: center;
      width: 100%;
    }

    .nav-link:hover,
    .cart-btn:hover {
      transform: none;
    }

    .nav-backdrop {
      display: block;
      position: fixed;
      inset: 64px 0 0 0;
      z-index: 1095;
      border: none;
      padding: 0;
      margin: 0;
      background: rgba(28, 28, 41, 0.35);
      cursor: pointer;
      animation: fade-in 0.2s ease;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
