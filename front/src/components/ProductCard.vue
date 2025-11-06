<template>
  <div class="product-card" :class="{ 'out-of-stock': isOutOfStock }">
    <div v-if="isOutOfStock" class="out-of-stock-overlay">
      <span class="out-of-stock-text">Fuera de Stock</span>
    </div>
    <RouterLink v-if="!isOutOfStock" class="product-image" :to="`/products/${productId}`">
      <img :src="imageUrl" :alt="product.name" @error="handleImageError" />
    </RouterLink>
    <div v-else class="product-image">
      <img :src="imageUrl" :alt="product.name" @error="handleImageError" />
    </div>
    <div class="product-info">
      <RouterLink v-if="!isOutOfStock" class="product-name" :to="`/products/${productId}`">
        <h3 class="product-name">{{ product.name }}</h3>
      </RouterLink>
      <h3 v-else class="product-name">{{ product.name }}</h3>
      <p class="product-brand">{{ product.brand }}</p>
      <p class="product-price">€{{ product.price.toFixed(2) }}</p>
      <p class="product-stock" :class="{ 'low-stock': (product.stock ?? 0) <= 5 }">Stock: {{ product.stock ?? 0 }}</p>
      <button class="add-to-cart" @click="addToCart" :disabled="isOutOfStock">Añadir al carrito</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCartStore } from "../stores/cartStore";
import { RouterLink } from 'vue-router';

const props = defineProps({
  product: { type: Object, required: true },
});

const cartStore = useCartStore();

const productId = computed(() => props.product._id || props.product.id || props.product.productId);

const imageUrl = computed(() => {
  if (!props.product.image) return "/placeholder.png";
  if (props.product.image.startsWith("http")) return props.product.image;
  return `http://localhost:4000${props.product.image}`;
});

const isOutOfStock = computed(() => {
  return (props.product.stock ?? 0) <= 0;
});

function handleImageError(e) {
  e.target.src = "/placeholder.png";
}

function addToCart() {
  if (isOutOfStock.value) return;
  cartStore.addToCart(props.product);
}
</script>

<style>
@import "../assets/products.css";
</style>
