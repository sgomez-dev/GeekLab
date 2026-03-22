<script>
  import { link, push } from 'svelte-spa-router';
  import { api } from '../services/api';
  import { buildImageUrl } from '../api/urls.js';
  import { getContext } from 'svelte';
  import { appActionsKey } from '../state/appContext.js';
  import { isAdminStore, productsStore } from '../state/appStore.js';
  import { addToast } from '../state/toastStore.js';
  import ConfirmModal from '../components/ConfirmModal.svelte';
  import { addToCart as addToCartToStore } from '../state/cartStore.js';

  let { params } = $props();

  const actions = getContext(appActionsKey);

  let loading = $state(true);
  let error = $state('');
  let product = $state(null);
  let isAddingToCart = $state(false);

  // Confirmación de eliminación (admin)
  let confirmDeleteOpen = $state(false);
  let confirmDeleting = $state(false);

  // Reseñas
  let newRating = $state(5);
  let hoverRating = $state(0);
  let newComment = $state('');
  let reviewError = $state('');
  let submittingReview = $state(false);

  const productId = () => params?.id ?? null;
  const stock = () => Number(product?.stock ?? 0);
  const estado = () => (stock() > 0 ? 'Activo' : 'No activo');

  const canSubmitReview = $derived(
    () => newComment.trim().length > 0 && newRating >= 1 && newRating <= 5
  );

  async function loadProduct() {
    loading = true;
    error = '';
    product = null;

    try {
      const id = productId();
      if (!id) throw new Error('Missing product id');
      const res = await api.get(`/products/${id}`);
      product = res.data;
    } catch (e) {
      error = e?.response?.data?.message || e?.message || 'Error cargando producto';
    } finally {
      loading = false;
    }
  }

  async function confirmDelete() {
    if (!product?._id || confirmDeleting) return;
    const id = product._id;
    confirmDeleteOpen = false;
    confirmDeleting = true;
    try {
      await api.delete(`/products/${id}`);
      actions.setProducts(
        ($productsStore || []).filter((p) => String(p?._id) !== String(id))
      );
      addToast({ type: 'success', message: 'Producto eliminado', duration: 2500 });
      await push('/products');
    } catch (e) {
      addToast({
        type: 'error',
        message: e?.response?.data?.message || e?.message || 'Error al eliminar',
        duration: 3500,
      });
    } finally {
      confirmDeleting = false;
    }
  }

  function requestDelete() {
    if (!product?._id || confirmDeleting) return;
    confirmDeleteOpen = true;
  }

  function addToCart() {
    if (!product) return;
    const productStock = stock();
    if (productStock <= 0) {
      addToast({ type: 'error', message: 'El producto está fuera de stock', duration: 3500 });
      return;
    }

    const result = addToCartToStore(product);
    if (!result.success) {
      addToast({ type: 'error', message: result.error || 'Error al agregar al carrito', duration: 3500 });
      return;
    }

    isAddingToCart = true;
    addToast({ type: 'success', message: '¡Agregado al carrito!', duration: 2500 });
    window.setTimeout(() => {
      isAddingToCart = false;
    }, 600);
  }

  async function submitReview() {
    reviewError = '';
    if (!product?._id) return;
    if (!canSubmitReview || submittingReview) {
      reviewError = 'Completa la calificación y el comentario';
      return;
    }

    submittingReview = true;
    try {
      const res = await api.post(`/products/${product._id}/reviews`, {
        rating: newRating,
        comment: newComment.trim(),
      });
      product = res.data;
      newComment = '';
      newRating = 5;
      hoverRating = 0;
      addToast({ type: 'success', message: '¡Gracias por tu reseña!', duration: 2500 });
    } catch (e) {
      reviewError = e?.response?.data?.message || e?.message || 'Error al enviar la reseña';
      addToast({ type: 'error', message: reviewError, duration: 3500 });
    } finally {
      submittingReview = false;
    }
  }

  $effect(() => {
    // Cargar cuando cambie el id de ruta
    const id = productId();
    if (!id) return;
    loadProduct();
  });
</script>

<section class="page">
  <div class="toolbar">
    <a class="back" href="/products" use:link>← Volver</a>

    {#if $isAdminStore && product?._id}
      <div class="admin-actions">
        <a
          class="secondary"
          href={`/products/${product._id}/edit`}
          use:link
        >Editar</a>
        <button class="danger" on:click={requestDelete} type="button" disabled={confirmDeleting}>
          Eliminar
        </button>
      </div>
    {/if}
  </div>

  {#if loading}
    <div class="status">Cargando...</div>
  {/if}

  {#if error}
    <div class="error" role="alert">{error}</div>
  {/if}

  {#if !loading && !error && product}
    <div class="grid">
      <div class="media">
        <img
          src={buildImageUrl(product?.image)}
          alt={product?.name}
          on:error={(e) => {
            const img = e.currentTarget;
            if (img?.dataset?.errored) return;
            img.dataset.errored = '1';
            img.src = '/vite.svg';
          }}
        />
      </div>

      <div class="info">
        <h1>{product.name}</h1>
        <div class="badges">
          <span class="pill" class:active={stock() > 0}>{estado()}</span>
          {#if product.brand}
            <span class="badge">{product.brand}</span>
          {/if}
          {#if product.category}
            <span class="badge">{product.category}</span>
          {/if}
        </div>

        <div class="price">€{Number(product.price ?? 0).toFixed(2)}</div>

        <div class="stock">
          Stock disponible: <strong>{stock()}</strong>
        </div>

        <div class="actions">
          <button
            class="primary add-to-cart"
            type="button"
            on:click={addToCart}
            disabled={stock() <= 0 || isAddingToCart}
          >
            {isAddingToCart ? '¡Agregado!' : 'Añadir al carrito'}
          </button>
        </div>

        {#if product.description}
          <div class="section">
            <h3>Descripción</h3>
            <p>{product.description}</p>
          </div>
        {/if}

        <div class="section reviews">
          <h3>Reseñas</h3>

          {#if (product.reviews?.length || 0) > 0}
            <div class="review-list">
              {#each product.reviews as r (r._id || r.createdAt)}
                <div class="review">
                  <div class="review-top">
                    <strong>{r.username}</strong>
                    <span class="rating">★ {r.rating}/5</span>
                  </div>
                  <div class="review-date">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                  </div>
                  <p class="review-comment">{r.comment}</p>
                </div>
              {/each}
            </div>
          {:else}
            <div class="section muted">Aún no hay reseñas.</div>
          {/if}

          <div class="review-form">
            <h4>Escribe tu reseña</h4>

            <div class="form-row">
              <label>Calificación</label>
              <div class="star-rating-input">
                {#each [1, 2, 3, 4, 5] as i}
                  <span
                    class="star-input"
                    class:filled={i <= newRating}
                    class:hover={i <= hoverRating}
                    on:click={() => {
                      newRating = i;
                    }}
                    on:mouseenter={() => {
                      hoverRating = i;
                    }}
                    on:mouseleave={() => {
                      hoverRating = 0;
                    }}
                    role="button"
                    tabindex="0"
                  >
                    ★
                  </span>
                {/each}
                <span class="rating-label">{newRating} de 5</span>
              </div>
            </div>

            <div class="form-row">
              <label for="comment">Comentario</label>
              <textarea
                id="comment"
                bind:value={newComment}
                rows="3"
                placeholder="Cuéntanos tu experiencia..."
              ></textarea>
            </div>

            <button
              class="submit-review"
              type="button"
              on:click={submitReview}
              disabled={!canSubmitReview || submittingReview}
            >
              {submittingReview ? 'Enviando...' : 'Enviar reseña'}
            </button>

            {#if reviewError}
              <div class="error" role="alert">{reviewError}</div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</section>

<ConfirmModal
  open={confirmDeleteOpen}
  title="Eliminar producto"
  message="¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  cancelLabel="Cancelar"
  disabled={confirmDeleting}
  onConfirm={confirmDelete}
  onCancel={() => {
    confirmDeleteOpen = false;
  }}
/>

<style>
  .page {
    padding: 24px 16px 40px;
  }

  .toolbar {
    max-width: 1200px;
    margin: 0 auto 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .back {
    text-decoration: none;
    font-weight: 900;
    color: var(--primary-color);
    background: rgba(66, 71, 193, 0.07);
    border: 1px solid rgba(66, 71, 193, 0.16);
    padding: 10px 14px;
    border-radius: 12px;
  }

  .admin-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .secondary {
    text-decoration: none;
    background: rgba(28, 28, 41, 0.06);
    border: 1px solid rgba(28, 28, 41, 0.14);
    color: var(--secondary-color);
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 900;
  }

  .danger {
    border: none;
    background: #ff6b6b;
    color: #fff;
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .status {
    max-width: 1200px;
    margin: 0 auto 14px;
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 18px;
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

  .grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 18px;
    align-items: start;
  }

  .media {
    background: var(--bg-card);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    aspect-ratio: 16/12;
    display: grid;
    place-items: center;
  }

  .media :global(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 14px;
  }

  .info {
    background: #fff;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    padding: 18px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  }

  h1 {
    margin: 0 0 10px;
    font-size: 2.1rem;
    line-height: 1.2;
  }

  .badges {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 10px;
  }

  .pill {
    font-size: 0.85rem;
    font-weight: 900;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
  }

  .pill.active {
    background: rgba(48, 168, 74, 0.12);
    border-color: rgba(48, 168, 74, 0.25);
    color: #2e7d32;
  }

  .badge {
    background: rgba(66, 71, 193, 0.06);
    border: 1px solid rgba(66, 71, 193, 0.14);
    color: rgba(28, 28, 41, 0.7);
    padding: 7px 12px;
    border-radius: 999px;
    font-weight: 800;
    font-size: 0.9rem;
  }

  .price {
    font-size: 1.6rem;
    font-weight: 1000;
    color: var(--primary-color);
    margin-bottom: 10px;
  }

  .stock {
    margin-bottom: 14px;
    color: rgba(28, 28, 41, 0.85);
  }

  .section {
    margin-top: 16px;
    border-top: 1px solid rgba(224, 224, 224, 0.9);
    padding-top: 14px;
  }

  h3 {
    margin: 0 0 8px;
    color: var(--primary-color);
  }

  p {
    margin: 0;
    color: rgba(28, 28, 41, 0.8);
    line-height: 1.55;
  }

  .muted {
    color: rgba(28, 28, 41, 0.7);
  }

  .review-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .review {
    border: 1px solid rgba(224, 224, 224, 0.9);
    border-radius: 14px;
    padding: 12px;
    background: rgba(66, 71, 193, 0.03);
  }

  .review-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
  }

  .rating {
    color: rgba(28, 28, 41, 0.7);
    font-weight: 900;
  }

  .review-date {
    color: rgba(28, 28, 41, 0.55);
    font-size: 0.9rem;
    margin-bottom: 8px;
  }

  .review-comment {
    color: rgba(28, 28, 41, 0.85);
  }

  .actions {
    margin: 14px 0 6px;
  }

  .primary {
    border: none;
    background: var(--primary-color);
    color: #fff;
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: 1000;
    cursor: pointer;
  }

  .add-to-cart:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .reviews {
    padding-top: 12px;
  }

  .review-form {
    margin-top: 18px;
    border-top: 1px solid rgba(224, 224, 224, 0.9);
    padding-top: 14px;
  }

  .review-form h4 {
    margin: 0 0 10px;
    color: var(--primary-color);
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  label {
    font-weight: 900;
    color: rgba(28, 28, 41, 0.75);
  }

  textarea {
    padding: 12px 12px;
    border-radius: 12px;
    border: 1px solid rgba(224, 224, 224, 0.95);
    background: #fff;
    outline: none;
    font-size: 1rem;
    font-family: inherit;
  }

  textarea:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(66, 71, 193, 0.12);
  }

  .star-rating-input {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .star-input {
    font-size: 28px;
    line-height: 1;
    color: rgba(224, 224, 224, 1);
    cursor: pointer;
    user-select: none;
  }

  .star-input.filled {
    color: #f5b50a;
  }

  .star-input.hover {
    color: #ffd700;
  }

  .rating-label {
    color: rgba(28, 28, 41, 0.7);
    font-weight: 900;
  }

  .submit-review {
    border: none;
    background: var(--primary-color);
    color: #fff;
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: 1000;
    cursor: pointer;
  }

  .submit-review:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error {
    margin-top: 12px;
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
    padding: 12px;
    border-radius: 14px;
  }

  @media (max-width: 920px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>

