<script>
  import { link } from 'svelte-spa-router';
  import { api } from '../services/api';
  import { isAdminStore, userStore } from '../state/appStore.js';
  import { addToast } from '../state/toastStore.js';
  import AdminUserCreateModal from '../components/admin/AdminUserCreateModal.svelte';
  import AdminUserEditModal from '../components/admin/AdminUserEditModal.svelte';
  import AdminUsersTable from '../components/admin/AdminUsersTable.svelte';
  import ConfirmModal from '../components/ConfirmModal.svelte';

  let loading = $state(true);
  let error = $state('');
  let users = $state([]);

  let createModalOpen = $state(false);
  let userToEdit = $state(null);
  let userToDelete = $state(null);
  let deleting = $state(false);
  let deletingId = $state(null);

  const currentUserId = $derived($userStore?.id ?? null);

  async function fetchUsers() {
    loading = true;
    error = '';
    try {
      const res = await api.get('/users');
      users = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      error = e?.response?.data?.message || e?.message || 'Error al cargar usuarios';
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if ($isAdminStore) fetchUsers();
  });

  function onUserCreated(created) {
    users = [created, ...users.filter((u) => String(u._id) !== String(created._id))];
    addToast({ type: 'success', message: 'Usuario creado', duration: 2500 });
  }

  function onUserUpdated(updated) {
    users = users.map((u) => (String(u._id) === String(updated._id) ? { ...u, ...updated } : u));
    addToast({ type: 'success', message: 'Usuario actualizado', duration: 2500 });
  }

  function openEdit(u) {
    userToEdit = u;
  }

  function closeEdit() {
    userToEdit = null;
  }

  function confirmDelete(u) {
    userToDelete = u;
  }

  function cancelDelete() {
    userToDelete = null;
  }

  async function deleteUser() {
    if (!userToDelete?._id || deleting) return;
    const id = userToDelete._id;
    deleting = true;
    deletingId = id;

    try {
      await api.delete(`/users/${id}`);
      users = users.filter((u) => String(u._id) !== String(id));
      userToDelete = null;
      addToast({ type: 'success', message: 'Usuario eliminado', duration: 2500 });
    } catch (e) {
      addToast({
        type: 'error',
        message: e?.response?.data?.message || e?.message || 'Error al eliminar usuario',
        duration: 4000,
      });
    } finally {
      deleting = false;
      deletingId = null;
    }
  }
</script>

<section class="page">
  <div class="toolbar">
    <a class="back" href="/products" use:link>← Catálogo</a>
    <div class="title">
      <h1>Gestión de usuarios</h1>
      <p class="muted">CRUD completo: listado, alta, edición (rol y datos) y baja. Solo administradores.</p>
    </div>

    <div class="actions">
      <button
        class="primary"
        type="button"
        onclick={() => (createModalOpen = true)}
        disabled={!$isAdminStore}
      >
        + Crear usuario
      </button>
    </div>
  </div>

  {#if loading}
    <div class="status">Cargando usuarios...</div>
  {/if}

  {#if error}
    <div class="error" role="alert">{error}</div>
  {/if}

  {#if !loading && !error}
    {#if users.length === 0}
      <div class="empty">No hay usuarios registrados.</div>
    {:else}
      <AdminUsersTable
        {users}
        {currentUserId}
        onEdit={openEdit}
        onDelete={confirmDelete}
        busyId={deletingId}
      />
    {/if}
  {/if}

  <AdminUserCreateModal bind:open={createModalOpen} onSuccess={onUserCreated} />

  <AdminUserEditModal
    open={!!userToEdit}
    user={userToEdit}
    {currentUserId}
    onClose={closeEdit}
    onSuccess={onUserUpdated}
  />

  <ConfirmModal
    open={!!userToDelete}
    title="Eliminar usuario"
    message={userToDelete ? `¿Eliminar a «${userToDelete.username}»? Esta acción no se puede deshacer.` : ''}
    confirmLabel="Eliminar"
    cancelLabel="Cancelar"
    disabled={deleting}
    onConfirm={deleteUser}
    onCancel={cancelDelete}
  />
</section>

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
    gap: 14px;
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

  h1 {
    margin: 0 0 6px;
    font-size: 2rem;
  }

  .muted {
    margin: 0;
    color: rgba(28, 28, 41, 0.7);
  }

  .actions {
    display: flex;
    align-items: center;
  }

  .primary {
    border: none;
    background: var(--primary-color);
    color: #fff;
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .primary:disabled {
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
  }

  .empty {
    max-width: 1200px;
    margin: 0 auto;
    background: #fff;
    border: 1px dashed rgba(28, 28, 41, 0.2);
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    color: rgba(28, 28, 41, 0.7);
  }
</style>
