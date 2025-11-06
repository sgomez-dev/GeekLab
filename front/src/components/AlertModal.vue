<template>
  <teleport to="body">
    <div class="overlay" @click.self="$emit('close')">
      <div class="modal">
        <header class="header">
          <h3>Aviso</h3>
        </header>
        <div class="content">
          <p>{{ message }}</p>
        </div>
        <div class="actions">
          <button @click="$emit('confirm')">Aceptar</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  message: { type: String, required: true }
});

defineEmits(['confirm', 'close']);
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
.modal { background:#ffffff; border:1px solid #e0e0e0; border-radius:12px; width:420px; max-width:95vw; padding:20px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.header { margin-bottom:10px; }
.header h3 { color: #4247c1; margin: 0; }
.content { margin: 8px 0 16px; color:#1c1c29; }
.actions { display:flex; justify-content:flex-end; }
button { background: var(--primary-color); color:#ffffff; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:500; transition: all 0.2s; }
button:hover { background: #3539a0; transform: translateY(-1px); }
</style>
