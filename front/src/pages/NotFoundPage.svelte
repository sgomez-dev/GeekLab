<script>
  import { link } from 'svelte-spa-router';
</script>

<section class="page">
  <div class="card">
    <h1>404</h1>
    <p class="muted">La ruta que buscas no existe.</p>
    <div class="actions">
      <a class="primary" href="/products" use:link>Volver al catálogo</a>
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
    max-width: 520px;
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 22px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  }

  h1 {
    margin: 0 0 8px;
    font-size: 2.1rem;
  }

  .muted {
    margin: 0 0 18px;
    color: rgba(28, 28, 41, 0.7);
  }

  .actions {
    display: flex;
    gap: 12px;
  }

  .primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--primary-color);
    color: #fff;
    text-decoration: none;
    font-weight: 600;
  }

  .primary:hover {
    filter: brightness(1.02);
  }
</style>

