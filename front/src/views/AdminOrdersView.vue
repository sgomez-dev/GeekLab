<template>
  <div class="admin-orders">
    <div class="admin-header">
      <h2>Gestión de Pedidos</h2>
      <p>Visualiza y gestiona todos los pedidos de la plataforma</p>
    </div>

    <div class="filters">
      <select v-model="selectedStatus" @change="fetchOrders" class="status-filter">
        <option value="">Todos los estados</option>
        <option value="pending">En curso (Pending)</option>
        <option value="completed">Completado (Completed)</option>
      </select>
    </div>

    <div v-if="loading" class="loading">
      <p>Cargando pedidos...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="orders-container">
      <div v-if="orders.length === 0" class="no-orders">
        <p>No hay pedidos disponibles</p>
      </div>

      <div v-else class="orders-list">
        <div
          v-for="order in orders"
          :key="order._id"
          class="order-card"
          @click="selectOrder(order)"
        >
          <div class="order-header">
            <div>
              <h3>Pedido #{{ order._id.slice(-6) }}</h3>
              <p class="order-user">
                Usuario: {{ order.userId?.username || 'N/A' }} ({{
                  order.userId?.email || 'N/A'
                }})
              </p>
            </div>
            <div class="order-status">
              <span :class="['status-badge', order.status]">
                {{ order.status === 'pending' ? 'En curso' : 'Completado' }}
              </span>
            </div>
          </div>
          <div class="order-info">
            <p><strong>Total:</strong> €{{ order.total.toFixed(2) }}</p>
            <p><strong>Fecha:</strong> {{ formatDate(order.createdAt) }}</p>
            <p><strong>Items:</strong> {{ order.items.length }} producto(s)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalle de pedido -->
    <div v-if="selectedOrder" class="modal-backdrop" @click="closeOrderDetail">
      <div class="modal order-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>Detalle del Pedido #{{ selectedOrder._id.slice(-6) }}</h3>
          <button @click="closeOrderDetail" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div class="detail-section">
            <h4>Información del Usuario</h4>
            <p><strong>Usuario:</strong> {{ selectedOrder.userId?.username || 'N/A' }}</p>
            <p><strong>Email:</strong> {{ selectedOrder.userId?.email || 'N/A' }}</p>
          </div>

          <div class="detail-section">
            <h4>Estado del Pedido</h4>
            <select
              :value="selectedOrder.status"
              @change="updateOrderStatus(selectedOrder._id, $event.target.value)"
              :disabled="updatingStatus"
              class="status-select"
            >
              <option value="pending">En curso (Pending)</option>
              <option value="completed">Completado (Completed)</option>
            </select>
          </div>

          <div class="detail-section">
            <h4>Productos</h4>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in selectedOrder.items" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>€{{ item.price.toFixed(2) }}</td>
                  <td>€{{ (item.price * item.quantity).toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3"><strong>Total:</strong></td>
                  <td><strong>€{{ selectedOrder.total.toFixed(2) }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="detail-section">
            <h4>Información Adicional</h4>
            <p><strong>Fecha de creación:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
            <p v-if="selectedOrder.updatedAt !== selectedOrder.createdAt">
              <strong>Última actualización:</strong> {{ formatDate(selectedOrder.updatedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useToast } from '../composables/useToast';

const { showToast } = useToast();

const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedStatus = ref('');
const selectedOrder = ref(null);
const updatingStatus = ref(false);

async function fetchOrders() {
  loading.value = true;
  error.value = null;
  try {
    const params = selectedStatus.value ? { status: selectedStatus.value } : {};
    const response = await api.get('/orders', { params });
    orders.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar pedidos';
    showToast(error.value, 'error', 3000);
  } finally {
    loading.value = false;
  }
}

function selectOrder(order) {
  selectedOrder.value = order;
}

function closeOrderDetail() {
  selectedOrder.value = null;
}

async function updateOrderStatus(orderId, newStatus) {
  if (updatingStatus.value) return;

  updatingStatus.value = true;
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
    // Actualizar el pedido en la lista
    const orderIndex = orders.value.findIndex((o) => o._id === orderId);
    if (orderIndex !== -1) {
      orders.value[orderIndex] = response.data.order;
    }
    // Actualizar el pedido seleccionado
    if (selectedOrder.value && selectedOrder.value._id === orderId) {
      selectedOrder.value.status = newStatus;
    }
    showToast('Estado del pedido actualizado correctamente', 'success', 2000);
  } catch (err) {
    showToast(err.response?.data?.message || 'Error al actualizar el estado', 'error', 3000);
    // Recargar pedidos para revertir el cambio visual
    await fetchOrders();
  } finally {
    updatingStatus.value = false;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.admin-orders {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  margin-bottom: 30px;
  text-align: center;
}

.admin-header h2 {
  color: #4247c1;
  margin-bottom: 10px;
}

.admin-header p {
  color: #666;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.status-filter {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  background: white;
}

.loading,
.error,
.no-orders {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #d32f2f;
}

.orders-list {
  display: grid;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.order-header h3 {
  margin: 0 0 5px 0;
  color: #4247c1;
}

.order-user {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: #ff9800;
  color: white;
}

.status-badge.completed {
  background-color: #4caf50;
  color: white;
}

.order-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  color: #666;
}

.order-info p {
  margin: 0;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.order-detail-modal {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #4247c1;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  color: #333;
}

.modal-content {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  color: #4247c1;
  margin-bottom: 15px;
  border-bottom: 2px solid #4247c1;
  padding-bottom: 5px;
}

.detail-section p {
  margin: 10px 0;
  color: #666;
}

.status-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  width: 200px;
}

.status-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.items-table th,
.items-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.items-table thead {
  background-color: #f5f5f5;
}

.items-table tfoot {
  background-color: #f9f9f9;
  font-weight: bold;
}

.items-table tfoot td {
  border-top: 2px solid #4247c1;
}
</style>

