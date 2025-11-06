import { defineStore } from 'pinia';
import { useUserStore } from './userStore';
import { watch } from 'vue';
import api from '../api/axios';

function getStorageKey(userId) {
  return userId ? `cart:${userId}` : 'cart:guest';
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    _storageKey: 'cart:guest',
  }),

  getters: {
    total: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
  },

  actions: {
    init() {
      const userStore = useUserStore();
      userStore.initFromToken?.();
      this._storageKey = getStorageKey(userStore.user?.id);
      this.items = JSON.parse(localStorage.getItem(this._storageKey)) || [];

      // React to user changes and swap cart accordingly
      watch(
        () => userStore.user?.id,
        (newId) => {
          this._storageKey = getStorageKey(newId);
          this.items = JSON.parse(localStorage.getItem(this._storageKey)) || [];
        }
      );
    },

    addToCart(product) {
      const productStock = product.stock ?? 0;
      if (productStock <= 0) {
        return { success: false, error: 'El producto está fuera de stock' };
      }

      const existingItem = this.items.find(item => item._id === product._id);
      if (existingItem) {
        // Verificar que no exceda el stock disponible
        if (existingItem.quantity >= productStock) {
          return { success: false, error: `No hay suficiente stock. Disponible: ${productStock} unidades` };
        }
        existingItem.quantity++;
      } else {
        this.items.push({ ...product, quantity: 1 });
      }
      this.saveCart();
      return { success: true };
    },

    removeFromCart(productId) {
      const index = this.items.findIndex(item => item._id === productId);
      if (index > -1) {
        this.items.splice(index, 1);
        this.saveCart();
      }
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item._id === productId);
      if (item) {
        const productStock = item.stock ?? 0;
        const newQuantity = Math.max(0, Math.min(quantity, productStock));
        item.quantity = newQuantity;
        if (item.quantity === 0) {
          this.removeFromCart(productId);
        } else {
          this.saveCart();
        }
        return { success: true, quantity: newQuantity };
      }
      return { success: false };
    },

    async checkout() {
      try {
        const response = await api.post('/checkout', {
          items: this.items
        });
        this.clearCart();
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al procesar la compra';
        const details = error.response?.data?.details || [];
        return { 
          success: false, 
          error: errorMessage,
          details
        };
      }
    },

    clearCart() {
      this.items = [];
      this.saveCart();
    },

    saveCart() {
      localStorage.setItem(this._storageKey, JSON.stringify(this.items));
    }
  }
});