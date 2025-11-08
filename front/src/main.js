import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router, { setupRouterGuard } from './router'
import './style.css'

import { useCartStore } from './stores/cartStore'

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Setup router guard after Pinia is initialized
setupRouterGuard();
app.use(router);

// Initialize per-user cart after pinia is ready and app is mounted
// Use nextTick to ensure everything is fully initialized
app.mount('#app');

// Initialize cart after mount to ensure Pinia is fully active
nextTick(() => {
  const cart = useCartStore();
  cart.init();
});
