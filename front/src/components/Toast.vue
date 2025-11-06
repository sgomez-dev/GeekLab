<template>
  <teleport to="body">
    <Transition name="toast">
      <div v-if="show" class="toast" :class="type">
        <div class="toast-content">
          <svg v-if="type === 'success'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span class="toast-message">{{ message }}</span>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  message: { type: String, required: true },
  type: { type: String, default: 'success' },
  duration: { type: Number, default: 3000 }
});

const show = ref(false);

onMounted(() => {
  show.value = true;
  setTimeout(() => {
    show.value = false;
  }, props.duration);
});
</script>

<style scoped>
.toast {
  position: fixed;
  top: 90px;
  right: 20px;
  z-index: 2000;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
}

.toast.success {
  border-left: 4px solid #7efc9a;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  width: 20px;
  height: 20px;
  color: #7efc9a;
  flex-shrink: 0;
}

.toast-message {
  color: #1c1c29;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Animaciones */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

