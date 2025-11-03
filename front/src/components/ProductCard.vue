<template>
  <div class="product-card">
    <div class="product-image">
      <img :src="imageUrl" :alt="product.name" @error="handleImageError" />
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-brand">{{ product.brand }}</p>
      <p class="product-price">€{{ product.price.toFixed(2) }}</p>
      <button class="add-to-cart" @click="addToCart">Añadir al carrito</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCartStore } from "../stores/cartStore";

const props = defineProps({
  product: { type: Object, required: true },
});

const cartStore = useCartStore();

const imageUrl = computed(() => {
  if (!props.product.image) return "/placeholder.png";
  if (props.product.image.startsWith("http")) return props.product.image;
  return `http://localhost:4000${props.product.image}`;
});

function handleImageError(e) {
  e.target.src = "/placeholder.png";
}

function addToCart() {
  cartStore.addToCart(props.product);
}
</script>

<style scoped>
@import "../assets/products.css";
</style>
