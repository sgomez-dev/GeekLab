<template>
  <div class="card">
    <img :src="product.image" alt="product" />
    <h3>{{ product.name }}</h3>
    <p>{{ product.brand }}</p>
    <p>€{{ product.price }}</p>
  </div>
</template>

<script setup>
defineProps({ product: Object });
</script>

<style scoped>
.card {
  background: #1a1a1a;
  color: #fff;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
}
img {
  width: 100%;
  border-radius: 10px;
}
</style>
