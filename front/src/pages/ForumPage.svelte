<script>
  import { onDestroy, onMount } from 'svelte';
  import { io } from 'socket.io-client';
  import { api } from '../services/api';
  import { addToast } from '../state/toastStore.js';

  const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    return String(envUrl || 'http://localhost:4000').replace(/\/$/, '');
  };

  const SOCKET_URL = getBackendUrl();

  let messages = $state([]);
  let content = $state('');

  let loading = $state(true);
  let sending = $state(false);
  let error = $state('');

  let socket = null;

  async function loadMessages() {
    loading = true;
    error = '';
    try {
      const res = await api.get('/forum/messages');
      messages = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      error = e?.response?.data?.message || e?.message || 'Error cargando el foro';
      addToast({ type: 'error', message: error, duration: 4000 });
    } finally {
      loading = false;
    }
  }

  function upsertMessage(msg) {
    if (!msg) return;
    const id = msg._id ? String(msg._id) : null;
    if (id && messages.some((m) => String(m?._id) === id)) return;

    messages = [...messages, msg].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async function submitMessage() {
    if (sending) return;
    const text = content.trim();
    if (!text) {
      error = 'El contenido es requerido';
      return;
    }

    sending = true;
    error = '';
    try {
      const res = await api.post('/forum/messages', { content: text });
      // Normalmente el socket emitirá el evento; aun así, agregamos si no está.
      upsertMessage(res.data);
      content = '';
      addToast({ type: 'success', message: 'Mensaje enviado', duration: 2500 });
    } catch (e) {
      error = e?.response?.data?.message || e?.message || 'Error al enviar el mensaje';
      addToast({ type: 'error', message: error, duration: 4000 });
    } finally {
      sending = false;
    }
  }

  onMount(async () => {
    await loadMessages();

    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socket.on('forum:new', (msg) => {
      upsertMessage(msg);
    });
  });

  onDestroy(() => {
    if (socket) {
      socket.off('forum:new');
      socket.disconnect();
    }
  });
</script>

<section class="page">
  <div class="header">
    <div>
      <h1>Foro</h1>
      <p class="muted">Participa en tiempo real con mensajes del equipo.</p>
    </div>
  </div>

  <div class="layout">
    <div class="feed">
      {#if loading}
        <div class="loading">Cargando mensajes...</div>
      {:else}
        {#if error}
          <div class="error" role="alert">{error}</div>
        {/if}

        {#if messages.length === 0}
          <div class="empty">Aún no hay mensajes.</div>
        {:else}
          <div class="message-list">
            {#each messages as m (m._id || m.createdAt)}
              <div class="message">
                <div class="message-top">
                  <strong class="username">{m.username}</strong>
                  <span class="date">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <div class="content">{m.content}</div>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>

    <div class="composer">
      <h2>Nuevo mensaje</h2>

      <textarea
        rows="4"
        bind:value={content}
        placeholder="Escribe tu mensaje..."
        maxlength="500"
      ></textarea>

      <div class="composer-actions">
        <button
          class="primary"
          type="button"
          on:click={submitMessage}
          disabled={sending || content.trim().length === 0}
        >
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>

      {#if error}
        <div class="error-inline" role="alert">{error}</div>
      {/if}
    </div>
  </div>
</section>

<style>
  .page {
    padding: 24px 16px 40px;
  }

  .header {
    max-width: 1200px;
    margin: 0 auto 16px;
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
  }

  h1 {
    margin: 0 0 8px;
    font-size: 2rem;
  }

  h2 {
    margin: 0 0 10px;
    font-size: 1.2rem;
    color: var(--primary-color);
  }

  .layout {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 16px;
    align-items: start;
  }

  .feed {
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 14px;
  }

  .composer {
    background: rgba(66, 71, 193, 0.05);
    border: 1px solid rgba(66, 71, 193, 0.14);
    border-radius: 18px;
    padding: 14px;
  }

  textarea {
    width: 100%;
    border-radius: 14px;
    border: 1px solid rgba(224, 224, 224, 0.95);
    background: #fff;
    padding: 12px;
    outline: none;
    font-size: 1rem;
    font-family: inherit;
  }

  textarea:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(66, 71, 193, 0.12);
  }

  .composer-actions {
    margin-top: 12px;
    display: flex;
    justify-content: space-between;
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

  .message-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .message {
    border: 1px solid rgba(224, 224, 224, 0.95);
    border-radius: 16px;
    padding: 12px;
    background: rgba(66, 71, 193, 0.03);
  }

  .message-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    margin-bottom: 6px;
  }

  .username {
    color: rgba(28, 28, 41, 0.95);
  }

  .date {
    color: rgba(28, 28, 41, 0.55);
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .content {
    white-space: pre-wrap;
    color: rgba(28, 28, 41, 0.85);
    line-height: 1.5;
  }

  .loading,
  .empty {
    padding: 18px 8px;
    text-align: center;
    color: rgba(28, 28, 41, 0.7);
  }

  .error {
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 14px;
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
    font-weight: 900;
    text-align: left;
  }

  .error-inline {
    margin-top: 12px;
    padding: 12px;
    border-radius: 14px;
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
    font-weight: 900;
  }

  @media (max-width: 980px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>

