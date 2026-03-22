import { writable } from 'svelte/store';

export const toasts = writable([]);

function nextId() {
  return Math.random().toString(16).slice(2);
}

export function addToast({ message, type = 'success', duration = 3000 }) {
  const id = nextId();
  toasts.update((list) => [...list, { id, message, type }]);

  window.setTimeout(() => {
    toasts.update((list) => list.filter((t) => t.id !== id));
  }, duration);
}

export function removeToast(id) {
  toasts.update((list) => list.filter((t) => t.id !== id));
}

