<script>
  let {
    open = false,
    title = '',
    onClose = () => {},
    children,
  } = $props();
</script>

{#if open}
  <div class="frame-root">
    <button type="button" class="backdrop" aria-label="Cerrar ventana" onclick={onClose}></button>
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      tabindex="-1"
    >
      <h2 id="admin-modal-title">{title}</h2>
      {@render children?.()}
    </div>
  </div>
{/if}

<style>
  .frame-root {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    pointer-events: none;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    border: none;
    padding: 0;
    margin: 0;
    background: rgba(0, 0, 0, 0.55);
    cursor: pointer;
    pointer-events: auto;
  }

  .modal {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    max-height: min(90vh, 720px);
    overflow: auto;
    background: #fff;
    border-radius: 16px;
    border: 1px solid rgba(224, 224, 224, 0.9);
    padding: 18px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    pointer-events: auto;
  }

  h2 {
    margin: 0 0 14px;
    font-size: 1.45rem;
    color: var(--primary-color);
  }
</style>
