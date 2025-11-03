<template>
  <div>
    <Navbar />
    <div class="catalog">
      <h2>Catálogo GeekLab</h2>
      <div class="product-grid">
        <ProductCard v-for="p in products" :key="p._id" :product="p" />
      </div>
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
  try {
    const res = await api.get("/products");
    products.value = res.data;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
});
</script>

<style scoped>
.catalog {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

@import "../assets/products.css";
</style>
