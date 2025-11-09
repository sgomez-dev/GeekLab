import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import router, { setupRouterGuard } from './router'
import './style.css'

const app = createApp(App);
const pinia = createPinia();

setActivePinia(pinia);
app.use(pinia);

setupRouterGuard();
app.use(router);

app.mount('#app');
