import { createApp } from 'vue'
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

// initialize per-user cart after pinia is ready
const cart = useCartStore();
cart.init();

app.mount('#app');
