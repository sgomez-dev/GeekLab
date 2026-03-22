<script>
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import { api } from '../services/api';
  import { appActionsKey } from '../state/appContext.js';
  import { isAdminStore, productsStore } from '../state/appStore.js';
  import ProductCard from '../components/ProductCard.svelte';
  import ConfirmModal from '../components/ConfirmModal.svelte';
  import { push } from 'svelte-spa-router';
  import { addToast } from '../state/toastStore.js';

  const actions = getContext(appActionsKey);

  let loading = $state(true);
  let error = $state('');
  let confirmOpen = $state(false);
  let confirmProductId = $state(null);
  let deletingId = $state(null);
  const skeletonItems = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  let searchTerm = $state('');
  let selectedBrand = $state('');
  let selectedCategory = $state('');
  let selectedPriceRange = $state('');

  const products = $derived($productsStore);

  const availableBrands = $derived(() => {
    const brands = products
      .map((p) => p?.brand)
      .filter((b) => b && String(b).trim().length > 0);
    return [...new Set(brands)].sort();
  });

  const availableCategories = $derived(() => {
    const cats = products
      .map((p) => p?.category)
      .filter((c) => c && String(c).trim().length > 0);
    return [...new Set(cats)].sort();
  });

  const filteredProducts = $derived(() => {
    let list = products.slice();

    // Priorizar los más recientes si el backend devuelve orden por creación
    list = list.slice().reverse();

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p?.name?.toLowerCase().includes(q) ||
          p?.brand?.toLowerCase().includes(q) ||
          p?.description?.toLowerCase().includes(q) ||
          p?.category?.toLowerCase().includes(q)
      );
    }

    if (selectedBrand) {
      list = list.filter((p) => p?.brand === selectedBrand);
    }

    if (selectedCategory) {
      list = list.filter((p) => p?.category === selectedCategory);
    }

    if (selectedPriceRange) {
      const range = selectedPriceRange;
      list = list.filter((p) => {
        const price = Number(p?.price ?? 0);
        if (range === '0-50') return price >= 0 && price <= 50;
        if (range === '50-100') return price > 50 && price <= 100;
        if (range === '100-200') return price > 100 && price <= 200;
        if (range === '200-500') return price > 200 && price <= 500;
        if (range === '500+') return price > 500;
        return true;
      });
    }

    return list;
  });

  const hasActiveFilters = $derived(() => {
    return (
      searchTerm.trim().length > 0 ||
      selectedBrand.length > 0 ||
      selectedCategory.length > 0 ||
      selectedPriceRange.length > 0
    );
  });

  async function loadProducts() {
    loading = true;
    error = '';
    try {
      const res = await api.get('/products');
      actions.setProducts(res.data);
    } catch (e) {
      error = e?.response?.data?.message || e?.message || 'Error cargando productos';
      addToast({ type: 'error', message: error, duration: 3500 });
    } finally {
      loading = false;
    }
  }

  onMount(loadProducts);

  // Sincronización (bonus): si el rol cambia y habilita/deshabilita acciones admin,
  // recargamos el catálogo para mantener consistencia.
  let lastIsAdmin = null;
  $effect(() => {
    const current = $isAdminStore;
    if (lastIsAdmin === null) {
      lastIsAdmin = current;
      return;
    }
    if (current !== lastIsAdmin) {
      lastIsAdmin = current;
      loadProducts();
    }
  });

  function clearFilters() {
    searchTerm = '';
    selectedBrand = '';
    selectedCategory = '';
    selectedPriceRange = '';
  }

  function requestDelete(productId) {
    confirmProductId = productId;
    confirmOpen = true;
  }

  async function confirmDelete() {
    const productId = confirmProductId;
    if (!productId || deletingId) return;

    deletingId = productId;
    confirmOpen = false;

    try {
      await api.delete(`/products/${productId}`);
      actions.setProducts(
        ($productsStore || []).filter((p) => String(p?._id) !== String(productId))
      );
      addToast({ type: 'success', message: 'Producto eliminado', duration: 2500 });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Error al eliminar el producto';
      addToast({ type: 'error', message: msg, duration: 3500 });
    } finally {
      deletingId = null;
      confirmProductId = null;
    }
  }
</script>

<section class="page">
  <header class="hero">
    <div>
      <h1>Productos</h1>
      <p class="muted">Explora, filtra y gestiona acciones según tu rol.</p>
    </div>

    {#if $isAdminStore}
      <div class="hero-actions">
        <button class="primary" on:click={() => push('/products/create')} type="button">
          + Crear producto
        </button>
      </div>
    {/if}
  </header>

  <div class="panel">
    <div class="filters">
      <div class="field search">
        <label>Buscar</label>
        <input
          type="text"
          placeholder="Nombre, marca, descripción o categoría..."
          bind:value={searchTerm}
        />
      </div>

      <div class="field">
        <label>Marca</label>
        <select bind:value={selectedBrand}>
          <option value="">Todas las marcas</option>
          {#each availableBrands as brand}
            <option value={brand}>{brand}</option>
          {/each}
        </select>
      </div>

      <div class="field">
        <label>Categoría</label>
        <select bind:value={selectedCategory}>
          <option value="">Todas las categorías</option>
          {#each availableCategories as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>
      </div>

      <div class="field">
        <label>Precio</label>
        <select bind:value={selectedPriceRange}>
          <option value="">Todos</option>
          <option value="0-50">€0 - €50</option>
          <option value="50-100">€50 - €100</option>
          <option value="100-200">€100 - €200</option>
          <option value="200-500">€200 - €500</option>
          <option value="500+">€500+</option>
        </select>
      </div>

      <div class="field actions">
        <button class="ghost" type="button" on:click={clearFilters} disabled={!hasActiveFilters}>
          Quitar filtros
        </button>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="skeleton-grid" aria-busy="true">
      {#each skeletonItems as _, i}
        <div class="skeleton-card" data-i={i}>
          <div class="sk-media"></div>
          <div class="sk-line w-70"></div>
          <div class="sk-line w-40"></div>
          <div class="sk-line w-80"></div>
          <div class="sk-line w-55"></div>
        </div>
      {/each}
    </div>
  {/if}

  {#if error}
    <div class="error" role="alert">{error}</div>
  {/if}

  {#if !loading && !error}
    {#if filteredProducts.length === 0}
      <div class="no-results">No se encontraron productos.</div>
    {:else}
      <div class="grid">
        {#each filteredProducts as p (p._id)}
          <ProductCard
            product={p}
            isAdmin={$isAdminStore}
            onDelete={requestDelete}
            isDeleting={String(deletingId) === String(p._id)}
          />
        {/each}
      </div>
    {/if}
  {/if}

  <ConfirmModal
    open={confirmOpen}
    title="Eliminar producto"
    message="¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer."
    confirmLabel="Eliminar"
    cancelLabel="Cancelar"
    disabled={!!deletingId}
    onConfirm={confirmDelete}
    onCancel={() => {
      confirmOpen = false;
      confirmProductId = null;
    }}
  />
</section>

<style>
  .page {
    padding: 24px 16px 40px;
  }

  .hero {
    max-width: 1200px;
    margin: 0 auto 16px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
  }

  h1 {
    margin: 0 0 8px;
    font-size: 2.1rem;
  }

  .muted {
    margin: 0;
    color: rgba(28, 28, 41, 0.7);
    font-size: 1rem;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .primary {
    border: none;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--primary-color);
    color: #fff;
    font-weight: 900;
    cursor: pointer;
    transition: transform 0.15s ease, filter 0.15s ease;
  }

  .primary:hover {
    transform: translateY(-1px);
    filter: brightness(1.02);
  }

  .panel {
    max-width: 1200px;
    margin: 0 auto 18px;
    background: rgba(66, 71, 193, 0.05);
    border: 1px solid rgba(66, 71, 193, 0.14);
    border-radius: 16px;
    padding: 16px;
  }

  .filters {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr auto;
    gap: 12px;
    align-items: end;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  label {
    font-size: 0.9rem;
    color: rgba(28, 28, 41, 0.75);
    font-weight: 700;
  }

  input,
  select {
    padding: 12px 12px;
    border-radius: 12px;
    border: 1px solid rgba(224, 224, 224, 0.95);
    background: #fff;
    outline: none;
    font-size: 1rem;
  }

  input:focus,
  select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(66, 71, 193, 0.12);
  }

  .actions {
    justify-content: flex-end;
  }

  .ghost {
    border: 1px solid rgba(66, 71, 193, 0.2);
    background: rgba(255, 255, 255, 0.7);
    color: var(--primary-color);
    font-weight: 900;
    padding: 12px 14px;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.15s ease, filter 0.15s ease;
  }

  .ghost:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ghost:not(:disabled):hover {
    transform: translateY(-1px);
    filter: brightness(1.02);
  }

  .skeleton-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    padding: 6px 0 14px;
  }

  .skeleton-card {
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
  }

  .sk-media {
    width: 100%;
    aspect-ratio: 16/10;
    border-radius: 12px;
    background: rgba(66, 71, 193, 0.08);
  }

  .sk-line {
    height: 12px;
    border-radius: 999px;
    background: rgba(66, 71, 193, 0.08);
  }

  .w-70 {
    width: 70%;
  }
  .w-40 {
    width: 40%;
  }
  .w-80 {
    width: 80%;
  }
  .w-55 {
    width: 55%;
  }

  .skeleton-card :global(*) {
    position: relative;
    overflow: hidden;
  }

  .skeleton-card .sk-media::after,
  .skeleton-card .sk-line::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
    transform: translateX(-100%);
    animation: shimmer 1.2s infinite;
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  .error {
    max-width: 1200px;
    margin: 0 auto 14px;
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
    border-radius: 14px;
    padding: 16px;
  }

  .no-results {
    max-width: 1200px;
    margin: 0 auto 14px;
    padding: 20px;
    border-radius: 14px;
    border: 1px dashed rgba(28, 28, 41, 0.22);
    color: rgba(28, 28, 41, 0.7);
    text-align: center;
    background: #fff;
  }

  .grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  @media (max-width: 1100px) {
    .filters {
      grid-template-columns: 1fr 1fr;
    }
    .skeleton-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: 1fr;
    }
    .filters {
      grid-template-columns: 1fr;
    }
    .skeleton-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

