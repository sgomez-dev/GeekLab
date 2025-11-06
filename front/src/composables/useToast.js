import { createApp, h } from 'vue';
import Toast from '../components/Toast.vue';

let toastContainer = null;

function showToast(message, type = 'success', duration = 3000) {
  // Crear un contenedor temporal para el toast
  const container = document.createElement('div');
  document.body.appendChild(container);

  // Crear la app Vue para el toast
  const app = createApp({
    render: () => h(Toast, { message, type, duration })
  });

  // Montar el toast
  app.mount(container);

  // Remover después de la animación
  setTimeout(() => {
    app.unmount();
    document.body.removeChild(container);
  }, duration + 500);
}

export function useToast() {
  return {
    showToast
  };
}

