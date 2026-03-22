import { derived, writable } from 'svelte/store';

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const tokenStore = writable(safeGet('token'));
export const userStore = writable(
  (() => {
    const raw = safeGet('user');
    return raw ? safeParseJSON(raw) : null;
  })()
);
export const productsStore = writable([]);

export const roleStore = derived(userStore, (u) => u?.role ?? null);
export const isAdminStore = derived(roleStore, (r) => r === 'admin');
export const productCountStore = derived(productsStore, (p) => p.length);

