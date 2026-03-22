<script>
  let {
    open = false,
    title = 'Confirmar',
    message = '',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    disabled = false,
    onConfirm,
    onCancel,
  } = $props();

  function confirm() {
    if (disabled) return;
    if (typeof onConfirm === 'function') onConfirm();
  }

  function cancel() {
    if (typeof onCancel === 'function') onCancel();
  }
</script>

{#if open}
  <div class="backdrop" role="dialog" aria-modal="true" on:click={cancel}>
    <div class="modal" on:click|stopPropagation>
      <h2>{title}</h2>
      <p>{message}</p>
      <div class="actions">
        <button class="secondary" type="button" on:click={cancel} disabled={disabled}>
          {cancelLabel}
        </button>
        <button class="danger" type="button" on:click={confirm} disabled={disabled}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
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

  p {
    margin: 0 0 14px;
    color: rgba(28, 28, 41, 0.7);
    line-height: 1.5;
  }

  .actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
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

  .secondary:disabled,
  .danger:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
</style>

