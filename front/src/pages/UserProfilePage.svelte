<script>
  import { getContext } from 'svelte';
  import { api } from '../services/api';
  import { appActionsKey } from '../state/appContext.js';
  import { userStore } from '../state/appStore.js';
  import { addToast } from '../state/toastStore.js';

  const actions = getContext(appActionsKey);

  let newPassword = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let loading = $state(false);

  async function changePassword(event) {
    event?.preventDefault?.();
    error = '';

    if (!newPassword || newPassword.length < 6) {
      error = 'La contraseña nueva debe tener al menos 6 caracteres.';
      addToast({ type: 'error', message: error, duration: 4000 });
      return;
    }

    if (newPassword !== confirmPassword) {
      error = 'Las contraseñas no coinciden.';
      addToast({ type: 'error', message: error, duration: 4000 });
      return;
    }

    loading = true;
    try {
      await api.put('/auth/password', { password: newPassword });
      newPassword = '';
      confirmPassword = '';
      addToast({ type: 'success', message: 'Contraseña actualizada correctamente', duration: 2500 });
    } catch (e) {
      error = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Error al cambiar la contraseña';
      addToast({ type: 'error', message: error, duration: 4000 });
    } finally {
      loading = false;
    }
  }

  function logout() {
    actions.logout();
  }
</script>

<section class="page">
  <div class="card">
    <h1>Mi cuenta</h1>
    <p class="muted">
      Usuario: <strong>{$userStore?.username ?? '-'}</strong>
      <br />
      Email: <strong>{$userStore?.email ?? '-'}</strong>
    </p>

    <div class="section">
      <h2>Cambiar contraseña</h2>

      <form class="form" onsubmit={changePassword}>
        <label>
          Contraseña nueva *
          <input
            type="password"
            bind:value={newPassword}
            minlength="6"
            required
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        <label>
          Confirmar contraseña *
          <input
            type="password"
            bind:value={confirmPassword}
            minlength="6"
            required
            placeholder="Repite la contraseña"
          />
        </label>

        {#if error}
          <div class="error" role="alert">{error}</div>
        {/if}

        <button class="primary" type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </form>
    </div>

    <div class="actions">
      <button class="secondary" type="button" onclick={logout} disabled={loading}>
        Cerrar sesión
      </button>
    </div>
  </div>
</section>

<style>
  .page {
    display: grid;
    place-items: center;
    padding: 28px 16px;
  }

  .card {
    width: 100%;
    max-width: 720px;
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 22px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  }

  h1 {
    margin: 0 0 8px;
    font-size: 1.6rem;
  }

  h2 {
    margin: 0 0 12px;
    font-size: 1.2rem;
    color: var(--primary-color);
  }

  .muted {
    margin: 0;
    color: rgba(28, 28, 41, 0.7);
    line-height: 1.5;
  }

  .section {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgba(224, 224, 224, 0.95);
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
    font-size: 0.95rem;
    font-weight: 700;
    color: rgba(28, 28, 41, 0.75);
  }

  input {
    padding: 12px 12px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: #fff;
    outline: none;
    font-size: 1rem;
  }

  input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(66, 71, 193, 0.12);
  }

  .primary {
    padding: 12px 14px;
    border: none;
    border-radius: 10px;
    background: var(--primary-color);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s ease, filter 0.15s ease;
    width: 100%;
    max-width: 240px;
  }

  .primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error {
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 800;
  }

  .actions {
    margin-top: 18px;
    display: flex;
    justify-content: flex-start;
  }

  .secondary {
    background: rgba(28, 28, 41, 0.06);
    border: 1px solid rgba(28, 28, 41, 0.14);
    color: rgba(28, 28, 41, 0.78);
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>

