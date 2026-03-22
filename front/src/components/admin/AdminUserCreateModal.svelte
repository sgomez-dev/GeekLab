<script>
  import { api } from '../../services/api';
  import AdminModalFrame from './AdminModalFrame.svelte';

  let {
    open = $bindable(false),
    onSuccess = () => {},
  } = $props();

  let creating = $state(false);
  let createError = $state('');

  let newUser = $state({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });

  function reset() {
    createError = '';
    newUser = { username: '', email: '', password: '', role: 'user' };
  }

  function close() {
    open = false;
    reset();
  }

  $effect(() => {
    if (open) reset();
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (creating) return;
    createError = '';
    creating = true;
    try {
      const res = await api.post('/users', newUser);
      const created = res.data?.user;
      if (created) onSuccess(created);
      close();
    } catch (err) {
      createError =
        err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Error creando usuario';
    } finally {
      creating = false;
    }
  }
</script>

<AdminModalFrame {open} title="Crear usuario" onClose={close}>
  {#snippet children()}
    <form class="form" onsubmit={handleSubmit}>
      <label>
        Usuario *
        <input bind:value={newUser.username} type="text" required autocomplete="off" />
      </label>

      <label>
        Email *
        <input bind:value={newUser.email} type="email" required autocomplete="off" />
      </label>

      <label>
        Contraseña *
        <input bind:value={newUser.password} type="password" minlength="6" required autocomplete="new-password" />
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
        <button class="secondary" type="button" onclick={close} disabled={creating}>Cancelar</button>
        <button class="primary" type="submit" disabled={creating}>
          {creating ? 'Creando...' : 'Crear'}
        </button>
      </div>
    </form>
  {/snippet}
</AdminModalFrame>

<style>
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
