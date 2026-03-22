import { derived, get, writable } from 'svelte/store';
import { api } from '../services/api';

export const cartItems = writable([]);

let storageKey = 'cart:guest';

function getStorageKey(userId) {
  return userId ? `cart:${userId}` : 'cart:guest';
}

function persist(items) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const itemCount = derived(cartItems, (items) =>
  items.reduce((sum, item) => sum + (item.quantity || 0), 0)
);

export const total = derived(cartItems, (items) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 0), 0)
);

export function initCart(userId) {
  storageKey = getStorageKey(userId ?? null);
  try {
    const raw = localStorage.getItem(storageKey);
    cartItems.set(raw ? JSON.parse(raw) : []);
  } catch {
    cartItems.set([]);
  }
}

export function addToCart(product) {
  const items = get(cartItems);
  const productId = product?._id ?? product?.id;
  const productStock = Number(product?.stock ?? 0);

  if (!productId) return { success: false, error: 'Producto inválido' };
  if (productStock <= 0) return { success: false, error: 'El producto está fuera de stock' };

  const existing = items.find((i) => String(i._id) === String(productId));
  if (existing) {
    if (existing.quantity >= productStock) {
      return { success: false, error: `No hay suficiente stock. Disponible: ${productStock} unidades` };
    }
    const next = items.map((i) =>
      String(i._id) === String(productId)
        ? { ...i, quantity: i.quantity + 1, stock: productStock }
        : i
    );
    cartItems.set(next);
    persist(next);
    return { success: true };
  }

  const { stock, ...productWithoutStock } = product || {};
  const next = [...items, { ...productWithoutStock, _id: productId, quantity: 1, stock: productStock }];
  cartItems.set(next);
  persist(next);
  return { success: true };
}

export function removeFromCart(productId) {
  const items = get(cartItems);
  const next = items.filter((i) => String(i._id) !== String(productId));
  cartItems.set(next);
  persist(next);
}

export function updateQuantity(productId, quantity) {
  const items = get(cartItems);
  const existing = items.find((i) => String(i._id) === String(productId));
  const maxStock = Number(existing?.stock ?? Infinity);
  const nextQty = Math.max(0, Number(quantity || 0));

  if (nextQty === 0) {
    removeFromCart(productId);
    return { success: true, quantity: 0 };
  }

  if (nextQty > maxStock) {
    return { success: false, error: `No hay suficiente stock. Disponible: ${maxStock} unidades` };
  }

  const next = items.map((i) =>
    String(i._id) === String(productId) ? { ...i, quantity: nextQty } : i
  );
  cartItems.set(next);
  persist(next);
  return { success: true, quantity: nextQty };
}

export function clearCart() {
  cartItems.set([]);
  persist([]);
}

export async function checkout() {
  const items = get(cartItems);
  if (!items.length) return { success: false, error: 'Tu carrito está vacío' };

  try {
    const res = await api.post('/checkout', { items });
    clearCart();
    return { success: true, data: res.data };
  } catch (e) {
    const resp = e?.response?.data;
    return {
      success: false,
      error: resp?.message || e?.message || 'Error al procesar la compra',
      details: resp?.details || [],
    };
  }
}

