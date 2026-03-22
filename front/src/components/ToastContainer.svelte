<script>
  import { toasts, removeToast } from '../state/toastStore.js';

  function dismiss(id) {
    removeToast(id);
  }
</script>

<div class="container" aria-live="polite" aria-relevant="additions removals">
  {#each $toasts as t (t.id)}
    <div class="toast" class:type-success={t.type === 'success'} class:type-error={t.type === 'error'}>
      <div class="message">{t.message}</div>
      <button class="close" type="button" on:click={() => dismiss(t.id)} aria-label="Cerrar">
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .container {
    position: fixed;
    top: 76px;
    right: 16px;
    z-index: 3000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: min(420px, calc(100vw - 32px));
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(224, 224, 224, 0.95);
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
    padding: 12px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    backdrop-filter: blur(10px);
  }

  .message {
    font-weight: 800;
    color: rgba(28, 28, 41, 0.9);
  }

  .close {
    border: none;
    background: rgba(28, 28, 41, 0.07);
    width: 34px;
    height: 34px;
    border-radius: 10px;
    font-size: 18px;
    line-height: 34px;
    cursor: pointer;
    color: rgba(28, 28, 41, 0.7);
  }

  .toast.type-success {
    border-color: rgba(48, 168, 74, 0.25);
    background: rgba(48, 168, 74, 0.10);
  }

  .toast.type-error {
    border-color: rgba(255, 107, 107, 0.35);
    background: rgba(255, 107, 107, 0.12);
  }
</style>

