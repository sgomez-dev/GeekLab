import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import router, { setupRouterGuard } from './router'
import './style.css'
import { getSocket } from './api/socket'

const app = createApp(App);
const pinia = createPinia();

setActivePinia(pinia);
app.use(pinia);

setupRouterGuard();
app.use(router);

// Initialize socket connection early
console.log('[Main] Initializing socket connection...');
const socket = getSocket();

app.mount('#app');
