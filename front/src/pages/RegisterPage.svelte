<script>
  import { link, push } from 'svelte-spa-router';
  import { api } from '../services/api';
  import { addToast } from '../state/toastStore.js';

  let username = '';
  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function onSubmit(event) {
    event.preventDefault();
    error = '';
    loading = true;
    try {
      await api.post('/auth/register', {
        username,
        email,
        password,
        role: 'user',
      });

      addToast({ type: 'success', message: 'Cuenta creada correctamente', duration: 2500 });
      await push('/login');
    } catch (e) {
      error =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        'Error al registrar';
      addToast({ type: 'error', message: error, duration: 4000 });
    } finally {
      loading = false;
    }
  }
</script>

<section class="page">
  <div class="card">
    <h1>Registro</h1>
    <p class="muted">Crea tu cuenta para acceder al catálogo.</p>

    <form class="form" on:submit={onSubmit}>
      <label>
        Usuario
        <input bind:value={username} required placeholder="Tu usuario" />
      </label>

      <label>
        Email
        <input bind:value={email} type="email" required placeholder="correo@ejemplo.com" />
      </label>

      <label>
        Contraseña
        <input bind:value={password} type="password" required minlength="6" placeholder="••••••••" />
      </label>

      {#if error}
        <div class="error" role="alert">{error}</div>
      {/if}

      <button class="primary" type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear cuenta'}
      </button>
    </form>

    <p class="small">
      ¿Ya tienes cuenta?
      <a href="/login" use:link>Inicia sesión</a>
    </p>
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
    max-width: 420px;
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

  .muted {
    margin: 0 0 18px;
    color: rgba(28, 28, 41, 0.7);
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
  }

  .primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .primary:not(:disabled):hover {
    transform: translateY(-1px);
    filter: brightness(1.02);
  }

  .error {
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 0.95rem;
  }

  .small {
    margin: 14px 0 0;
    font-size: 0.95rem;
    color: rgba(28, 28, 41, 0.75);
  }

  .small :global(a) {
    color: var(--primary-color);
    text-decoration: none;
  }
  .small :global(a:hover) {
    text-decoration: underline;
  }
</style>

