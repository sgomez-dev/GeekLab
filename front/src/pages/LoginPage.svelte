<script>
  import { link } from 'svelte-spa-router';
  import { push } from 'svelte-spa-router';
  import { getContext } from 'svelte';
  import { appActionsKey } from '../state/appContext.js';
  import { api } from '../services/api';

  function decodeJwtPayload(token) {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  const { applyLogin } = getContext(appActionsKey);

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function onSubmit(event) {
    event.preventDefault();
    error = '';
    loading = true;
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data?.token;
      const payload = token ? decodeJwtPayload(token) : null;

      const nextUser = {
        id: payload?.id ?? null,
        username: res.data?.username ?? '',
        role: res.data?.role ?? 'user',
        email,
      };

      applyLogin(token, nextUser);
      await push('/products');
    } catch (e) {
      error = e?.response?.data?.error || e?.response?.data?.message || 'Error al iniciar sesión';
    } finally {
      loading = false;
    }
  }
</script>

<section class="page">
  <div class="card">
    <h1>Iniciar sesión</h1>
    <p class="muted">Accede a tu cuenta para ver productos y gestionar acciones.</p>

    <form class="form" on:submit={onSubmit}>
      <label>
        Email
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          bind:value={email}
          required
        />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          placeholder="••••••••"
          bind:value={password}
          required
        />
      </label>

      {#if error}
        <div class="error" role="alert">{error}</div>
      {/if}

      <button class="primary" type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>

    <p class="small">
      ¿No tienes cuenta?
      <a href="/register" use:link>Regístrate</a>
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

