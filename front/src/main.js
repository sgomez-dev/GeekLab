import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import router, { setupRouterGuard } from './router'
import './style.css'
import { useCartStore } from './stores/cartStore'

const app = createApp(App);
const pinia = createPinia();

// Set Pinia as active before installing it
// This ensures stores can be used immediately
setActivePinia(pinia);

// Install Pinia
app.use(pinia);

// Initialize cart store after Pinia is active
// This ensures stores are ready before any component tries to use them
const cart = useCartStore();
cart.init();

// Setup router guard after Pinia and stores are initialized
setupRouterGuard();

// Install router
app.use(router);

// Mount the app - all stores are now ready
app.mount('#app');
