<script>
  import { link } from 'svelte-spa-router';
  import { buildImageUrl } from '../api/urls.js';

  let { product, isAdmin, onDelete, isDeleting = false } = $props();

  const productId = () => product?._id ?? product?.id;
  const stock = () => Number(product?.stock ?? 0);
  const estado = () => (stock() > 0 ? 'Activo' : 'No activo');

  function handleDelete() {
    if (!isAdmin || isDeleting) return;
    const id = productId();
    if (!id) return;
    if (typeof onDelete === 'function') onDelete(id);
  }

  function handleImageError(event) {
    // Evita bucles si el placeholder también falla.
    const img = event.currentTarget;
    if (img?.dataset?.errored) return;
    img.dataset.errored = '1';
    img.src = '/vite.svg';
  }
</script>

<article class="card">
  <a class="media" href={`/products/${productId()}`} use:link>
    <img
      src={buildImageUrl(product?.image)}
      alt={product?.name || 'Producto'}
      on:error={handleImageError}
      loading="lazy"
    />
  </a>

  <div class="content">
    <div class="top">
      <a class="name" href={`/products/${productId()}`} use:link>
        {product?.name}
      </a>
      <span class="pill" class:active={stock() > 0}>
        {estado()}
      </span>
    </div>

    <div class="price">€{Number(product?.price ?? 0).toFixed(2)}</div>

    <div class="meta">
      <span class="meta-item">
        Stock: <strong>{stock()}</strong>
      </span>
      {#if product?.brand}
        <span class="meta-item">{product.brand}</span>
      {/if}
      {#if product?.category}
        <span class="meta-item">{product.category}</span>
      {/if}
    </div>

    {#if isAdmin}
      <div class="actions">
        <button class="danger" on:click={handleDelete} type="button" disabled={isDeleting}>
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    {/if}
  </div>
</article>

<style>
  .card {
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
  }

  .media {
    display: block;
    aspect-ratio: 16/10;
    background: var(--bg-card);
  }

  .media :global(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .content {
    padding: 14px 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .name {
    color: var(--secondary-color);
    text-decoration: none;
    font-weight: 800;
    line-height: 1.2;
  }

  .name:hover {
    text-decoration: underline;
  }

  .pill {
    font-size: 0.78rem;
    font-weight: 700;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
    white-space: nowrap;
  }

  .pill.active {
    background: rgba(48, 168, 74, 0.12);
    border-color: rgba(48, 168, 74, 0.25);
    color: #2e7d32;
  }

  .price {
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--primary-color);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    color: rgba(28, 28, 41, 0.7);
    font-size: 0.92rem;
  }

  .meta-item {
    background: rgba(66, 71, 193, 0.06);
    border: 1px solid rgba(66, 71, 193, 0.12);
    padding: 4px 8px;
    border-radius: 999px;
  }

  .actions {
    margin-top: 2px;
    display: flex;
    justify-content: flex-end;
  }

  button {
    font-family: inherit;
  }

  .danger {
    border: none;
    padding: 10px 12px;
    border-radius: 12px;
    background: #ff6b6b;
    color: #fff;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s ease, filter 0.15s ease;
  }

  .danger:hover {
    transform: translateY(-1px);
    filter: brightness(1.02);
  }
</style>

