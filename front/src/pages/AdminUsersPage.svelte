<script>
  import { link, push } from 'svelte-spa-router';
  import { api } from '../services/api';
  import { isAdminStore, userStore } from '../state/appStore.js';
  import { addToast } from '../state/toastStore.js';

  let loading = $state(true);
  let error = $state('');
  let users = $state([]);

  let createModalOpen = $state(false);
  let creating = $state(false);
  let createError = $state('');

  let newUser = $state({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });

  let userToDelete = $state(null);
  let deleting = $state(false);

  let updatingRoles = $state({});

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
    // Recargar cuando llegue el auth admin (o al primer render)
    if ($isAdminStore) fetchUsers();
  });

  function openCreateModal() {
    createError = '';
    newUser = { username: '', email: '', password: '', role: 'user' };
    createModalOpen = true;
  }

  function closeCreateModal() {
    createModalOpen = false;
    createError = '';
  }

  async function createUser() {
    if (creating) return;
    createError = '';
    creating = true;
    try {
      const res = await api.post('/users', newUser);
      const created = res.data?.user;
      if (created) users = [created, ...users];
      closeCreateModal();
    } catch (e) {
      createError = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Error creando usuario';
    } finally {
      creating = false;
    }
  }

  async function changeRole(userId, role) {
    if (!userId) return;
    if (updatingRoles[userId]) return;

    updatingRoles = { ...updatingRoles, [userId]: true };
    try {
      await api.put(`/users/${userId}/role`, { role });
      users = users.map((u) => (u._id === userId ? { ...u, role } : u));
    } catch (e) {
      addToast({
        type: 'error',
        message: e?.response?.data?.message || e?.message || 'Error al actualizar el rol',
        duration: 4000,
      });
      await fetchUsers();
    } finally {
      updatingRoles = { ...updatingRoles, [userId]: false };
    }
  }

  function confirmDelete(user) {
    userToDelete = user;
  }

  function cancelDelete() {
    userToDelete = null;
  }

  async function deleteUser() {
    if (!userToDelete?._id || deleting) return;
    const id = userToDelete._id;
    deleting = true;

    try {
      await api.delete(`/users/${id}`);
      users = users.filter((u) => u._id !== id);
      userToDelete = null;
    } catch (e) {
      addToast({
        type: 'error',
        message: e?.response?.data?.message || e?.message || 'Error al eliminar usuario',
        duration: 4000,
      });
    } finally {
      deleting = false;
    }
  }
</script>

<section class="page">
  <div class="toolbar">
    <a class="back" href="/products" use:link>← Catálogo</a>
    <div class="title">
      <h1>Gestión de usuarios</h1>
      <p class="muted">Crea usuarios, cambia roles y elimina cuentas.</p>
    </div>

    <div class="actions">
      <button class="primary" type="button" on:click={openCreateModal} disabled={!$isAdminStore}>
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
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each users as u (u._id)}
              <tr>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    class="select"
                    value={u.role}
                    on:change={(e) => changeRole(u._id, e.currentTarget.value)}
                    disabled={String(u._id) === String(currentUserId) || updatingRoles[u._id]}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td class="td-actions">
                  <button
                    class="danger"
                    type="button"
                    on:click={() => confirmDelete(u)}
                    disabled={String(u._id) === String(currentUserId) || deleting || updatingRoles[u._id]}
                  >
                    {deleting && userToDelete?._id === u._id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}

  {#if createModalOpen}
    <div class="modal-backdrop" on:click={closeCreateModal}>
      <div class="modal" on:click|stopPropagation>
        <h2>Crear usuario</h2>
        <form class="form" on:submit|preventDefault={createUser}>
          <label>
            Usuario *
            <input bind:value={newUser.username} type="text" required />
          </label>

          <label>
            Email *
            <input bind:value={newUser.email} type="email" required />
          </label>

          <label>
            Contraseña *
            <input bind:value={newUser.password} type="password" minlength="6" required />
          </label>

          <label>
            Rol *
            <select bind:value={newUser.role}>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          {#if createError}
            <div class="error-msg" role="alert">{createError}</div>
          {/if}

          <div class="modal-actions">
            <button class="secondary" type="button" on:click={closeCreateModal} disabled={creating}>
              Cancelar
            </button>
            <button class="primary" type="submit" disabled={creating}>
              {creating ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if userToDelete}
    <div class="modal-backdrop" on:click={cancelDelete}>
      <div class="modal" on:click|stopPropagation>
        <h2>Confirmar eliminación</h2>
        <p class="muted">
          ¿Eliminar a <strong>{userToDelete.username}</strong>? Esta acción no se puede deshacer.
        </p>
        <div class="modal-actions">
          <button class="secondary" type="button" on:click={cancelDelete} disabled={deleting}>
            Cancelar
          </button>
          <button class="danger" type="button" on:click={deleteUser} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  {/if}
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

  .table-wrap {
    max-width: 1200px;
    margin: 0 auto;
    background: #fff;
    border-radius: 14px;
    border: 1px solid var(--border-color);
    overflow: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
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
  }

  .select {
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(224, 224, 224, 0.95);
    background: #fff;
    outline: none;
    font-weight: 700;
  }

  .td-actions {
    white-space: nowrap;
  }

  .danger {
    border: none;
    background: #ff6b6b;
    color: #fff;
    padding: 10px 12px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .danger:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 16px;
  }

  .modal {
    width: 100%;
    max-width: 520px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid rgba(224, 224, 224, 0.9);
    padding: 18px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  }

  h2 {
    margin: 0 0 10px;
    font-size: 1.45rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 900;
    color: rgba(28, 28, 41, 0.75);
    font-size: 0.95rem;
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

  .error-msg {
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
    padding: 12px;
    border-radius: 14px;
    font-weight: 800;
  }

  .modal-actions {
    margin-top: 14px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .secondary {
    background: rgba(28, 28, 41, 0.06);
    border: 1px solid rgba(28, 28, 41, 0.14);
    color: var(--secondary-color);
    padding: 10px 12px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>

