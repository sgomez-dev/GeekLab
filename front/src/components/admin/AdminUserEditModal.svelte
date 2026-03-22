<script>
  import { api } from '../../services/api';
  import AdminModalFrame from './AdminModalFrame.svelte';

  let {
    open = false,
    user = null,
    currentUserId = null,
    onClose = () => {},
    onSuccess = () => {},
  } = $props();

  let saving = $state(false);
  let editError = $state('');

  let draft = $state({
    username: '',
    email: '',
    role: 'user',
    password: '',
  });

  const isSelf = $derived(
    user && currentUserId != null && String(user._id) === String(currentUserId)
  );

  $effect(() => {
    if (open && user) {
      editError = '';
      draft = {
        username: user.username ?? '',
        email: user.email ?? '',
        role: user.role ?? 'user',
        password: '',
      };
    }
  });

  function close() {
    editError = '';
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user?._id || saving) return;
    editError = '';
    saving = true;
    try {
      const body = {
        username: draft.username.trim(),
        email: draft.email.trim().toLowerCase(),
        role: draft.role,
      };
      if (draft.password.trim().length > 0) {
        body.password = draft.password;
      }
      if (isSelf) {
        delete body.role;
      }

      const res = await api.put(`/users/${user._id}`, body);
      const updated = res.data?.user;
      if (updated) onSuccess(updated);
      close();
    } catch (err) {
      editError =
        err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Error al guardar';
    } finally {
      saving = false;
    }
  }
</script>

<AdminModalFrame {open} title="Editar usuario" onClose={close}>
  {#snippet children()}
    {#if user}
      <form class="form" onsubmit={handleSubmit}>
        <label>
          Usuario *
          <input bind:value={draft.username} type="text" required autocomplete="off" />
        </label>

        <label>
          Email *
          <input bind:value={draft.email} type="email" required autocomplete="off" />
        </label>

        <label>
          Rol *
          <select bind:value={draft.role} disabled={isSelf}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        {#if isSelf}
          <p class="hint">No puedes cambiar tu propio rol desde aquí.</p>
        {/if}

        <label>
          Nueva contraseña (opcional)
          <input
            bind:value={draft.password}
            type="password"
            minlength="6"
            placeholder="Dejar vacío para no cambiar"
            autocomplete="new-password"
          />
        </label>

        {#if editError}
          <div class="error-msg" role="alert">{editError}</div>
        {/if}

        <div class="modal-actions">
          <button class="secondary" type="button" onclick={close} disabled={saving}>Cancelar</button>
          <button class="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    {/if}
  {/snippet}
</AdminModalFrame>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .hint {
    margin: -4px 0 0;
    font-size: 0.88rem;
    color: rgba(28, 28, 41, 0.6);
    font-weight: 600;
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

  select:disabled {
    opacity: 0.65;
    cursor: not-allowed;
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

  .primary {
    border: none;
    background: var(--primary-color);
    color: #fff;
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
