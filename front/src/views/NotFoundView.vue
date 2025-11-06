<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Página no encontrada</h2>
      <p class="error-message">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <button class="back-button" @click="goToCatalog">
        Volver al catálogo
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goToCatalog() {
  router.push('/products');
}
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: #4247c1;
  margin: 0;
  line-height: 1;
  opacity: 0.8;
}

.error-title {
  font-size: 2rem;
  color: #1c1c29;
  margin: 20px 0 16px;
  font-weight: 600;
}

.error-message {
  font-size: 1.1rem;
  color: #1c1c29;
  opacity: 0.7;
  margin: 0 0 32px;
  line-height: 1.6;
}

.back-button {
  background: #4247c1;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #3539a0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 71, 193, 0.3);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-message {
    font-size: 1rem;
  }
}
</style>

