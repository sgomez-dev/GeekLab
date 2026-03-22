<script>
  import { onMount } from 'svelte';
  import { buildImageUrl } from '../api/urls.js';
  import {
    cartItems,
    checkout,
    itemCount,
    removeFromCart,
    total,
    updateQuantity,
  } from '../state/cartStore.js';
  import { addToast } from '../state/toastStore.js';

  let { open = false, onClose } = $props();

  let checkoutLoading = $state(false);
  let checkoutError = $state('');

  function close() {
    checkoutError = '';
    if (typeof onClose === 'function') onClose();
  }

  async function onCheckout() {
    if (checkoutLoading) return;
    checkoutError = '';
    checkoutLoading = true;

    try {
      const res = await checkout();
      if (!res.success) {
        checkoutError = res.error || 'Error al hacer checkout';
        addToast({ type: 'error', message: checkoutError, duration: 4000 });
        return;
      }
      addToast({ type: 'success', message: 'Compra realizada correctamente', duration: 3000 });
      close();
    } catch (e) {
      checkoutError = e?.message || 'Error al hacer checkout';
      addToast({ type: 'error', message: checkoutError, duration: 4000 });
    } finally {
      checkoutLoading = false;
    }
  }
</script>

{#if open}
  <div class="backdrop" role="dialog" aria-modal="true" on:click={close}>
    <div class="modal" on:click|stopPropagation>
      <div class="header">
        <div>
          <h2>Tu carrito</h2>
          <p class="muted">{String($itemCount)} artículo(s)</p>
        </div>
        <button class="close" type="button" on:click={close} aria-label="Cerrar">
          ×
        </button>
      </div>

      {#if $cartItems.length === 0}
        <div class="empty">
          <p>Tu carrito está vacío.</p>
          <button class="primary" type="button" on:click={close}>Seguir comprando</button>
        </div>
      {:else}
        <div class="items">
          {#each $cartItems as item (item._id)}
            <div class="item">
              <div class="thumb">
                <img
                  src={buildImageUrl(item?.image)}
                  alt={item?.name || 'Producto'}
                  loading="lazy"
                />
              </div>

              <div class="body">
                <div class="row">
                  <div class="name">{item?.name}</div>
                  <div class="line-total">€{(Number(item?.price || 0) * Number(item?.quantity || 0)).toFixed(2)}</div>
                </div>

                <div class="row controls">
                  <div class="qty">
                    <button
                      class="step"
                      type="button"
                      on:click={() => updateQuantity(item._id, Number(item.quantity || 0) - 1)}
                      disabled={Number(item.quantity || 0) <= 1}
                    >
                      -
                    </button>
                    <div class="qty-value">{item.quantity}</div>
                    <button
                      class="step"
                      type="button"
                      on:click={() => updateQuantity(item._id, Number(item.quantity || 0) + 1)}
                      disabled={Number(item.quantity || 0) >= Number(item.stock ?? Infinity)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    class="remove"
                    type="button"
                    on:click={() => removeFromCart(item._id)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <div class="footer">
          <div class="total">
            Total: <strong>€{$total.toFixed(2)}</strong>
          </div>

          <div class="footer-actions">
            <button class="secondary" type="button" on:click={close} disabled={checkoutLoading}>
              Seguir navegando
            </button>
            <button class="primary" type="button" on:click={onCheckout} disabled={checkoutLoading}>
              {checkoutLoading ? 'Procesando...' : 'Finalizar compra'}
            </button>
          </div>
        </div>
      {/if}

      {#if checkoutError}
        <div class="error" role="alert">{checkoutError}</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 2600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .modal {
    width: 100%;
    max-width: 980px;
    max-height: 85vh;
    overflow: auto;
    background: #fff;
    border: 1px solid rgba(224, 224, 224, 0.95);
    border-radius: 18px;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.28);
  }

  .header {
    padding: 16px 16px 10px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    border-bottom: 1px solid rgba(224, 224, 224, 0.9);
  }

  h2 {
    margin: 0 0 6px;
    font-size: 1.5rem;
    color: var(--secondary-color);
  }

  .muted {
    margin: 0;
    color: rgba(28, 28, 41, 0.7);
  }

  .close {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: none;
    background: rgba(28, 28, 41, 0.06);
    cursor: pointer;
    font-size: 24px;
    line-height: 40px;
    font-weight: 900;
    color: rgba(28, 28, 41, 0.7);
  }

  .items {
    padding: 14px 16px 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .item {
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 12px;
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 12px;
    background: rgba(66, 71, 193, 0.03);
  }

  .thumb {
    border-radius: 14px;
    border: 1px solid rgba(224, 224, 224, 0.8);
    overflow: hidden;
    aspect-ratio: 16/10;
    display: grid;
    place-items: center;
    background: rgba(66, 71, 193, 0.05);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
  }

  .controls {
    justify-content: space-between;
  }

  .name {
    font-weight: 900;
    color: rgba(28, 28, 41, 0.95);
  }

  .line-total {
    font-weight: 1000;
    color: var(--primary-color);
    white-space: nowrap;
  }

  .qty {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .step {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(224, 224, 224, 0.95);
    background: #fff;
    cursor: pointer;
    font-weight: 900;
    color: rgba(28, 28, 41, 0.75);
  }

  .step:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .qty-value {
    font-weight: 1000;
    min-width: 20px;
    text-align: center;
  }

  .remove {
    border: none;
    background: rgba(255, 107, 107, 0.1);
    color: #d32f2f;
    padding: 10px 12px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
    white-space: nowrap;
  }

  .footer {
    padding: 12px 16px 16px;
    border-top: 1px solid rgba(224, 224, 224, 0.9);
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .total {
    font-weight: 900;
    color: rgba(28, 28, 41, 0.85);
  }

  .footer-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .secondary {
    background: rgba(28, 28, 41, 0.06);
    border: 1px solid rgba(28, 28, 41, 0.14);
    color: var(--secondary-color);
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
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

  .primary:disabled,
  .secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .empty {
    padding: 22px 16px;
    text-align: center;
    color: rgba(28, 28, 41, 0.75);
  }

  .empty p {
    margin: 0 0 12px;
  }

  .error {
    padding: 0 16px 16px;
    color: #d32f2f;
    font-weight: 900;
  }

  @media (max-width: 720px) {
    .item {
      grid-template-columns: 1fr;
    }
    .thumb {
      aspect-ratio: 16/10;
    }
  }
</style>

