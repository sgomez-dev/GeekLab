<template>
  <div>
    <Navbar />
    <h2>Catálogo GeekLab</h2>
    <div class="grid">
      <ProductCard v-for="p in products" :key="p._id" :product="p" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import Navbar from "../components/Navbar.vue";
import ProductCard from "../components/ProductCard.vue";

const products = ref([]);

onMounted(async () => {
  const res = await api.get("/products");
  products.value = res.data;
});
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
}
</style>
