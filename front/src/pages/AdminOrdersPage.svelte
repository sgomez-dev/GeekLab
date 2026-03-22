<script>
  import { link } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import ConfirmModal from '../components/ConfirmModal.svelte';
  import { api } from '../services/api';
  import { addToast } from '../state/toastStore.js';

  let loading = $state(true);
  let error = $state('');
  let orders = $state([]);

  // '' = todas, 'pending' | 'completed'
  let statusFilter = $state('');

  // Modal de confirmación de cambio de estado
  let confirmOpen = $state(false);
  let confirmBusy = $state(false);
  let orderToUpdate = $state(null);
  let nextStatus = $state('completed');

  async function loadOrders() {
    loading = true;
    error = '';

    try {
      const res = await api.get('/orders', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      orders = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      error =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Error al cargar pedidos';
      addToast({ type: 'error', message: error, duration: 4000 });
    } finally {
      loading = false;
    }
  }

  function openUpdateModal(order, status) {
    orderToUpdate = order;
    nextStatus = status;
    confirmOpen = true;
  }

  async function applyStatusUpdate() {
    if (!orderToUpdate?._id || confirmBusy) return;
    confirmBusy = true;
    const id = orderToUpdate._id;

    try {
      await api.put(`/orders/${id}/status`, { status: nextStatus });
      orders = orders.map((o) => (o._id === id ? { ...o, status: nextStatus } : o));
      addToast({ type: 'success', message: 'Estado del pedido actualizado', duration: 2500 });
      confirmOpen = false;
      orderToUpdate = null;
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Error al actualizar el estado';
      addToast({ type: 'error', message: msg, duration: 4000 });
    } finally {
      confirmBusy = false;
    }
  }

  function closeConfirm() {
    confirmOpen = false;
    orderToUpdate = null;
  }

  onMount(loadOrders);
</script>

<section class="page">
  <div class="toolbar">
    <a class="back" href="/products" use:link>← Catálogo</a>
    <div class="title">
      <h1>Gestión de pedidos</h1>
      <p class="muted">Admin: listado de pedidos y control del estado.</p>
    </div>

    <div class="filters">
      <label class="filter">
        Estado
        <select
          bind:value={statusFilter}
          on:change={() => loadOrders()}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="completed">Completados</option>
        </select>
      </label>
      <button class="ghost" type="button" on:click={loadOrders} disabled={loading}>
        {loading ? 'Cargando...' : 'Recargar'}
      </button>
    </div>
  </div>

  {#if loading}
    <div class="status">Cargando pedidos...</div>
  {/if}

  {#if error}
    <div class="error" role="alert">{error}</div>
  {/if}

  {#if !loading && !error}
    {#if orders.length === 0}
      <div class="empty">No hay pedidos para el filtro actual.</div>
    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each orders as o (o._id)}
              <tr>
                <td class="mono">{o._id}</td>
                <td>{o.userId?.username ?? '-'}</td>
                <td>
                  <span class="pill" class:pending={o.status === 'pending'} class:completed={o.status === 'completed'}>
                    {o.status === 'pending' ? 'Pendiente' : 'Completado'}
                  </span>
                </td>
                <td>€{Number(o.total ?? 0).toFixed(2)}</td>
                <td class="td-actions">
                  {#if o.status === 'pending'}
                    <button class="primary" type="button" on:click={() => openUpdateModal(o, 'completed')} disabled={confirmBusy}>
                      Marcar como completado
                    </button>
                  {:else}
                    <button class="secondary" type="button" on:click={() => openUpdateModal(o, 'pending')} disabled={confirmBusy}>
                      Reabrir como pendiente
                    </button>
                  {/if}
                </td>
              </tr>
              <tr>
                <td colspan="5">
                  <details class="details">
                    <summary>Ver items</summary>
                    <div class="items">
                      {#if o.items?.length}
                        {#each o.items as it, idx (String(it.productId ?? idx))}
                          <div class="item-row">
                            <div class="item-name">{it.name}</div>
                            <div class="item-meta">
                              x{Number(it.quantity ?? 0)} · €{Number(it.price ?? 0).toFixed(2)}
                            </div>
                          </div>
                        {/each}
                      {:else}
                        <div class="muted">Sin items.</div>
                      {/if}
                    </div>
                  </details>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}

  <ConfirmModal
    open={confirmOpen}
    title="Actualizar estado"
    message={`¿Seguro que quieres cambiar el estado del pedido a "${nextStatus === 'pending' ? 'pendiente' : 'completado'}"?`}
    confirmLabel="Guardar"
    cancelLabel="Cancelar"
    disabled={confirmBusy}
    onConfirm={applyStatusUpdate}
    onCancel={closeConfirm}
  />
</section>

<style>
  .page {
    padding: 28px 16px;
  }

  .toolbar {
    max-width: 1200px;
    margin: 0 auto 18px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .back {
    text-decoration: none;
    font-weight: 900;
    color: var(--primary-color);
    background: rgba(66, 71, 193, 0.07);
    border: 1px solid rgba(66, 71, 193, 0.16);
    padding: 10px 14px;
    border-radius: 12px;
    white-space: nowrap;
  }

  .title {
    flex: 1;
    min-width: 260px;
  }

  h1 {
    margin: 0 0 8px;
    font-size: 1.8rem;
  }

  .muted {
    margin: 0;
    color: rgba(28, 28, 41, 0.7);
  }

  .filters {
    display: flex;
    gap: 12px;
    align-items: end;
    flex-wrap: wrap;
  }

  .filter {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 800;
    color: rgba(28, 28, 41, 0.75);
  }

  select {
    padding: 12px 12px;
    border-radius: 12px;
    border: 1px solid rgba(224, 224, 224, 0.95);
    background: #fff;
    outline: none;
    font-size: 1rem;
  }

  select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(66, 71, 193, 0.12);
  }

  .ghost {
    background: rgba(28, 28, 41, 0.06);
    border: 1px solid rgba(28, 28, 41, 0.14);
    color: var(--secondary-color);
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .ghost:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
    font-weight: 900;
  }

  .empty {
    max-width: 1200px;
    margin: 0 auto 14px;
    background: #fff;
    border: 1px dashed rgba(28, 28, 41, 0.2);
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    color: rgba(28, 28, 41, 0.7);
  }

  .table-wrap {
    max-width: 1200px;
    margin: 0 auto;
    background: #fff;
    border-radius: 14px;
    border: 1px solid var(--border-color);
    overflow: hidden;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    min-width: 860px;
  }

  th {
    text-align: left;
    padding: 14px 16px;
    background: rgba(66, 71, 193, 0.12);
    color: rgba(28, 28, 41, 0.85);
    font-weight: 1000;
  }

  td {
    padding: 14px 16px;
    border-top: 1px solid rgba(224, 224, 224, 0.9);
    vertical-align: top;
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.92rem;
  }

  .td-actions {
    white-space: nowrap;
  }

  .pill {
    display: inline-block;
    padding: 7px 12px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 0.92rem;
    border: 1px solid rgba(66, 71, 193, 0.2);
    background: rgba(66, 71, 193, 0.06);
  }

  .pill.pending {
    border-color: rgba(255, 107, 107, 0.35);
    background: rgba(255, 107, 107, 0.12);
    color: #d32f2f;
  }

  .pill.completed {
    border-color: rgba(48, 168, 74, 0.25);
    background: rgba(48, 168, 74, 0.12);
    color: #2e7d32;
  }

  .primary {
    border: none;
    background: var(--primary-color);
    color: #fff;
    padding: 10px 12px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
    white-space: nowrap;
  }

  .primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .secondary {
    background: rgba(28, 28, 41, 0.06);
    border: 1px solid rgba(28, 28, 41, 0.14);
    color: rgba(28, 28, 41, 0.78);
    padding: 10px 12px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
    white-space: nowrap;
  }

  .secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .details {
    width: 100%;
    padding: 6px 0 10px;
  }

  details summary {
    cursor: pointer;
    font-weight: 900;
    color: var(--secondary-color);
    padding: 0 16px;
  }

  .items {
    padding: 10px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    border: 1px solid rgba(224, 224, 224, 0.95);
    border-radius: 14px;
    padding: 10px 12px;
    background: rgba(66, 71, 193, 0.03);
  }

  .item-name {
    font-weight: 1000;
    color: rgba(28, 28, 41, 0.9);
  }

  .item-meta {
    font-weight: 900;
    color: rgba(28, 28, 41, 0.7);
    white-space: nowrap;
  }

  @media (max-width: 900px) {
    .table {
      min-width: 720px;
    }
  }
</style>

