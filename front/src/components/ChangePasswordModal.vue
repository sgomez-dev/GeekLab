<template>
  <teleport to="body">
    <div class="overlay" @click.self="$emit('close')">
      <div class="modal">
        <header class="header">
          <h3>Cambiar contraseña</h3>
          <button class="close" @click="$emit('close')">✕</button>
        </header>
        <form @submit.prevent="submit">
          <div class="field">
            <label>Nueva contraseña</label>
            <input type="password" v-model="newPassword" required />
          </div>
          <div class="field">
            <label>Confirmar nueva contraseña</label>
            <input type="password" v-model="confirmNewPassword" required />
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <div class="actions">
            <button type="button" @click="$emit('close')">Cancelar</button>
            <button type="submit" :disabled="loading">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api/axios';

const emit = defineEmits(['close', 'changed']);

const newPassword = ref('');
const confirmNewPassword = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  if (newPassword.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }
  if (newPassword.value !== confirmNewPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  loading.value = true;
  try {
    const res = await api.put('/auth/password', { password: newPassword.value });
    // emit success so parent can logout and redirect
    newPassword.value = '';
    confirmNewPassword.value = '';
    loading.value = false;
    emit('changed');
  } catch (e) {
    error.value = e?.response?.data?.message || 'Error al actualizar la contraseña';
    loading.value = false;
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  width: 420px;
  max-width: 95vw;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.header h3 {
  color: #4247c1;
  margin: 0;
}
.close { background:#f0f0f5; color:#1c1c29; border:none; width:28px; height:28px; border-radius:6px; cursor:pointer; transition: all 0.2s; }
.close:hover { background:#e0e0e0; }
.field { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.field label {
  color: #4247c1;
  font-weight: 500;
}
input { background:#f8f9fa; color:#1c1c29; border:1px solid #e0e0e0; border-radius:6px; padding:10px; }
input:focus {
  outline: none;
  border-color: #4247c1;
  background: #ffffff;
}
.actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
button {
  cursor:pointer;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
}
button[type="button"] {
  background: #f0f0f5;
  color: #1c1c29;
}
button[type="button"]:hover {
  background: #e0e0e0;
}
button[type="submit"] {
  background: var(--primary-color);
  color: #ffffff;
}
button[type="submit"]:hover:not(:disabled) {
  background: #3539a0;
  transform: translateY(-1px);
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error { color: #ff6b6b; margin: 6px 0; }
</style>
