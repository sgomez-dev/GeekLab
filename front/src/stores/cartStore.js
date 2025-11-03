import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart')) || [],
  }),

  getters: {
    total: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
  },

  actions: {
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
      localStorage.setItem('cart', JSON.stringify(this.items));
    }
  }
});