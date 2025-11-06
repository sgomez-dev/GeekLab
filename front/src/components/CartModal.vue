<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="onClose">
      <div class="modal-content">
        <header class="modal-header">
          <h3>Carrito</h3>
          <button class="close-btn" @click="onClose">✕</button>
        </header>

        <div v-if="items.length === 0" class="empty-cart">El carrito está vacío</div>
        <div v-else>
          <div v-for="item in items" :key="item._id" class="cart-item">
            <img :src="getImageUrl(item)" :alt="item.name" />
            <div class="cart-item-info">
              <h4 class="cart-item-name">{{ item.name }}</h4>
              <p class="cart-item-price">€{{ item.price }}</p>
            </div>
            <div class="cart-quantity">
              <button @click="$emit('decrease', item)">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="$emit('increase', item)">+</button>
            </div>
          </div>
          <div class="cart-total">Total: €{{ total.toFixed(2) }}</div>
          <button class="checkout-button" @click="$emit('checkout')">Proceder al pago</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  total: { type: Number, required: true },
});

const emit = defineEmits(['close', 'increase', 'decrease', 'checkout']);

function onClose() {
  emit('close');
}

function getImageUrl(product) {
  if (!product.image) return '/placeholder.png';
  if (product.image.startsWith('http')) return product.image;
  return `http://localhost:4000${product.image}`;
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  width: 520px;
  max-width: 95vw;
  max-height: 85vh;
  overflow: auto;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-header h3 {
  color: #4247c1;
  margin: 0;
}

.close-btn {
  background: #f0f0f5;
  color: #1c1c29;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e0e0e0;
}

.empty-cart {
  text-align: center;
  padding: 40px 0;
  color: #1c1c29;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.cart-item img {
  max-width: 150px;
  max-height: 105px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin-right: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
}

.cart-item-info {
  flex-grow: 1;
}

.cart-item-name {
  font-size: 0.95rem;
  margin: 0;
  color: #1c1c29;
  font-weight: 500;
}

.cart-item-price {
  color: var(--primary-color);
  margin-top: 4px;
  font-weight: 600;
}

.cart-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-quantity button {
  background: #f0f0f5;
  border: 1px solid #e0e0e0;
  color: #1c1c29;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.cart-quantity button:hover {
  background: #4247c1;
  color: #ffffff;
  border-color: #4247c1;
}

.cart-total {
  margin-top: 16px;
  text-align: right;
  font-weight: bold;
  color: #1c1c29;
  font-size: 1.1rem;
}

.checkout-button {
  width: 100%;
  background: var(--primary-color);
  color: #ffffff;
  border: none;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.checkout-button:hover {
  background: #3539a0;
  transform: translateY(-1px);
}
</style>
