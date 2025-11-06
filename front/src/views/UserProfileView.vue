<template>
  <div class="profile">
    <div class="container">
      <h2>Mi cuenta</h2>
      <div class="card">
        <div class="row">
          <span class="label">Usuario</span>
          <span class="value">{{ user?.username }}</span>
        </div>
        <div class="row">
          <span class="label">Correo</span>
          <span class="value">{{ user?.email }}</span>
        </div>
        <div class="row">
          <span class="label">Contraseña</span>
          <span class="value">••••••••</span>
          <button class="link" @click="openChangePassword">Cambiar contraseña</button>
        </div>
      </div>

      <h3 class="section-title">Mis pedidos</h3>
      <div class="orders">
        <div v-if="ordersLoading" class="muted">Cargando pedidos...</div>
        <div v-else-if="orders.length === 0" class="muted">Aún no tienes pedidos.</div>
        <div v-else class="order-list">
          <div v-for="o in orders" :key="o._id" class="order">
            <div class="order-header">
              <span>Pedido del {{ formatDate(o.createdAt) }}</span>
              <span class="total">Total: €{{ o.total.toFixed(2) }}</span>
            </div>
            <ul class="order-items">
              <li v-for="(it, idx) in o.items" :key="idx">
                <span class="name">{{ it.name }}</span>
                <span class="qty">x{{ it.quantity }}</span>
                <span class="price">€{{ it.price.toFixed(2) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <ChangePasswordModal v-if="showPwd" @close="showPwd = false" @changed="onPasswordChanged" />
    <AlertModal
      v-if="showAlert"
      :message="'Tu contraseña se actualizó correctamente. Serás redirigido al inicio de sesión.'"
      @confirm="confirmRedirect"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import ChangePasswordModal from '../components/ChangePasswordModal.vue';
import AlertModal from '../components/AlertModal.vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const userStore = useUserStore();
const router = useRouter();
const user = computed(() => userStore.user);
const showPwd = ref(false);
const showAlert = ref(false);

const orders = ref([]);
const ordersLoading = ref(true);

function openChangePassword() {
  showPwd.value = true;
}

function onPasswordChanged() {
  showPwd.value = false;
  showAlert.value = true;
}

function confirmRedirect() {
  showAlert.value = false;
  userStore.logout();
  router.push('/login');
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return ''; }
}

async function loadOrders() {
  ordersLoading.value = true;
  try {
    const res = await api.get('/orders/my');
    orders.value = res.data;
  } catch (e) {
    console.error('Error cargando pedidos', e);
  } finally {
    ordersLoading.value = false;
  }
}

onMounted(loadOrders);
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
}
h2 {
  color: #4247c1;
}
.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.row {
  display: grid;
  grid-template-columns: 160px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}
.row:last-child { border-bottom: none; }
.label { color: #1c1c29; opacity: 0.7; font-weight: 500; }
.value { color: #1c1c29; }
.link { background: transparent; color: var(--primary-color); border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: all 0.2s; }
.link:hover { background: #f0f0f5; }
.section-title { margin-top: 20px; color: #4247c1; }
.orders { margin-top: 8px; }
.muted { color: #1c1c29; opacity: 0.6; }
.order { background:#ffffff; border:1px solid #e0e0e0; border-radius:8px; padding:12px; margin-bottom:10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.order-header { display:flex; justify-content:space-between; margin-bottom:6px; }
.total { font-weight: 600; color: #4247c1; }
.order-items { list-style:none; padding:0; margin:0; }
.order-items li { display:grid; grid-template-columns: 1fr auto auto; gap:12px; padding:6px 0; border-bottom:1px solid #e0e0e0; }
.order-items li:last-child { border-bottom:none; }
.name { color:#1c1c29; }
.qty, .price { color:#1c1c29; opacity: 0.7; }
</style>
