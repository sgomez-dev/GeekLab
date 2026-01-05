<template>
  <div class="admin-users">
    <div class="admin-header">
      <h2>Gestión de Usuarios</h2>
      <p>Administra los usuarios registrados en la plataforma</p>
      <button @click="openCreateModal" class="btn-create">
        <svg
          class="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Crear Usuario
      </button>
    </div>

    <div v-if="loading" class="loading">
      <p>Cargando usuarios...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <select
                :value="user.role"
                @change="changeRole(user._id, $event.target.value)"
                :disabled="user._id === currentUserId || updatingRoles[user._id]"
                class="role-select"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </td>
            <td>
              <button
                @click="confirmDelete(user)"
                :disabled="user._id === currentUserId || deletingUsers[user._id]"
                class="btn-delete"
              >
                {{ deletingUsers[user._id] ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="no-users">
        <p>No hay usuarios registrados</p>
      </div>
    </div>

    <!-- Modal de crear usuario -->
    <div v-if="showCreateModal" class="modal-backdrop" @click="closeCreateModal">
      <div class="modal create-user-modal" @click.stop>
        <h3>Crear Nuevo Usuario</h3>
        <form @submit.prevent="createUser">
          <div class="form-group">
            <label for="username">Usuario *</label>
            <input
              id="username"
              v-model="newUser.username"
              type="text"
              required
              placeholder="Nombre de usuario"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="email">Email *</label>
            <input
              id="email"
              v-model="newUser.email"
              type="email"
              required
              placeholder="correo@ejemplo.com"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="password">Contraseña *</label>
            <input
              id="password"
              v-model="newUser.password"
              type="password"
              required
              minlength="6"
              placeholder="Mínimo 6 caracteres"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="role">Rol *</label>
            <select id="role" v-model="newUser.role" required class="form-input">
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div v-if="createError" class="error-message">{{ createError }}</div>
          <div class="modal-actions">
            <button type="button" @click="closeCreateModal" class="btn-cancel" :disabled="creating">
              Cancelar
            </button>
            <button type="submit" class="btn-confirm-create" :disabled="creating">
              {{ creating ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="userToDelete" class="modal-backdrop" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h3>Confirmar eliminación</h3>
        <p>
          ¿Estás seguro de que deseas eliminar al usuario
          <strong>{{ userToDelete.username }}</strong>? Esta acción no se puede deshacer.
        </p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn-cancel">Cancelar</button>
          <button @click="deleteUser" class="btn-confirm">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import { useUserStore } from '../stores/userStore';
import { useToast } from '../composables/useToast';

const userStore = useUserStore();
const { showToast } = useToast();

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const updatingRoles = ref({});
const deletingUsers = ref({});
const userToDelete = ref(null);
const showCreateModal = ref(false);
const creating = ref(false);
const createError = ref(null);
const newUser = ref({
  username: '',
  email: '',
  password: '',
  role: 'user'
});

const currentUserId = computed(() => {
  const token = userStore.token;
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json).id;
  } catch {
    return null;
  }
});

async function fetchUsers() {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get('/users');
    users.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar usuarios';
    showToast(error.value, 'error', 3000);
  } finally {
    loading.value = false;
  }
}

async function changeRole(userId, newRole) {
  if (updatingRoles.value[userId]) return;

  updatingRoles.value[userId] = true;
  try {
    await api.put(`/users/${userId}/role`, { role: newRole });
    const user = users.value.find((u) => u._id === userId);
    if (user) {
      user.role = newRole;
    }
    showToast('Rol actualizado correctamente', 'success', 2000);
  } catch (err) {
    showToast(err.response?.data?.message || 'Error al actualizar el rol', 'error', 3000);
    // Recargar usuarios para revertir el cambio visual
    await fetchUsers();
  } finally {
    updatingRoles.value[userId] = false;
  }
}

function confirmDelete(user) {
  userToDelete.value = user;
}

function cancelDelete() {
  userToDelete.value = null;
}

async function deleteUser() {
  if (!userToDelete.value) return;

  const userId = userToDelete.value._id;
  deletingUsers.value[userId] = true;

  try {
    await api.delete(`/users/${userId}`);
    users.value = users.value.filter((u) => u._id !== userId);
    showToast('Usuario eliminado correctamente', 'success', 2000);
    userToDelete.value = null;
  } catch (err) {
    showToast(err.response?.data?.message || 'Error al eliminar el usuario', 'error', 3000);
  } finally {
    deletingUsers.value[userId] = false;
  }
}

function openCreateModal() {
  newUser.value = { username: '', email: '', password: '', role: 'user' };
  createError.value = null;
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
  newUser.value = { username: '', email: '', password: '', role: 'user' };
  createError.value = null;
}

async function createUser() {
  if (creating.value) return;

  creating.value = true;
  createError.value = null;

  try {
    const response = await api.post('/users', newUser.value);
    users.value.unshift(response.data.user);
    showToast('Usuario creado correctamente', 'success', 2000);
    closeCreateModal();
  } catch (err) {
    createError.value = err.response?.data?.message || err.response?.data?.error || 'Error al crear el usuario';
    showToast(createError.value, 'error', 3000);
  } finally {
    creating.value = false;
  }
}

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.admin-users {
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

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #4247c1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-top: 15px;
  transition: all 0.2s;
}

.btn-create:hover {
  background-color: #3539a0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 71, 193, 0.3);
}

.btn-create .icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.loading,
.error,
.no-users {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #d32f2f;
}

.users-table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background-color: #4247c1;
  color: white;
}

.users-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
}

.users-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.users-table tbody tr:hover {
  background-color: #f5f5f5;
}

.role-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.role-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.btn-delete {
  padding: 8px 16px;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background-color: #b71c1c;
}

.btn-delete:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal h3 {
  margin-top: 0;
  color: #4247c1;
}

.modal p {
  margin: 20px 0;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-confirm {
  background-color: #d32f2f;
  color: white;
}

.btn-confirm:hover {
  background-color: #b71c1c;
}

.create-user-modal {
  max-width: 500px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #1c1c29;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4247c1;
  box-shadow: 0 0 0 2px rgba(66, 71, 193, 0.1);
}

.error-message {
  color: #d32f2f;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  border-left: 4px solid #d32f2f;
}

.btn-confirm-create {
  background-color: #4247c1;
  color: white;
}

.btn-confirm-create:hover:not(:disabled) {
  background-color: #3539a0;
}

.btn-confirm-create:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

