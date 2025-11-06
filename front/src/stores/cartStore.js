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
      const existingItem = this.items.find(item => item._id === product._id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.items.push({ ...product, quantity: 1 });
      }
      this.saveCart();
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
        item.quantity = Math.max(0, quantity);
        if (item.quantity === 0) {
          this.removeFromCart(productId);
        } else {
          this.saveCart();
        }
      }
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