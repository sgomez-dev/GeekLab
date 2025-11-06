<template>
  <div>
    <div class="catalog">
      <h2>Catálogo GeekLab</h2>
      
      <!-- Search and Filters Section -->
      <div class="search-filters">
        <div class="search-bar">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Buscar productos..." 
            class="search-input"
          />
        </div>
        
        <div class="filters">
          <select v-model="selectedBrand" class="filter-select">
            <option value="">Todas las Marcas</option>
            <option v-for="brand in availableBrands" :key="brand" :value="brand">
              {{ brand }}
            </option>
          </select>
          
          <select v-model="selectedType" class="filter-select">
            <option value="">Todos los Tipos</option>
            <option v-for="type in availableTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
          
          <select v-model="selectedPriceRange" class="filter-select">
            <option value="">Todos los Precios</option>
            <option value="0-50">€0 - €50</option>
            <option value="50-100">€50 - €100</option>
            <option value="100-200">€100 - €200</option>
            <option value="200-500">€200 - €500</option>
            <option value="500+">€500+</option>
          </select>
        </div>
      </div>
      
      <div class="product-grid">
        <ProductCard v-for="p in filteredProducts" :key="p._id || p.id || p.productId" :product="p" />
      </div>
      
      <div v-if="filteredProducts.length === 0" class="no-results">
        <p>No se encontraron productos que coincidan con los filtros.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import api from "../api/axios";
import ProductCard from "../components/ProductCard.vue";
import { io } from 'socket.io-client';

const products = ref([]);
const socket = io('http://localhost:4000');
const searchTerm = ref('');
const selectedBrand = ref('');
const selectedType = ref('');
const selectedPriceRange = ref('');

const productsSorted = computed(() => {
  // Si el backend entrega nuevo al final, invertimos para mostrarlo primero
  return products.value.slice().reverse();
});

// Get unique brands and types from products
const availableBrands = computed(() => {
  const brands = products.value
    .map(p => p.brand)
    .filter(brand => brand && brand.trim() !== '');
  return [...new Set(brands)].sort();
});

const availableTypes = computed(() => {
  const types = products.value
    .map(p => p.category)
    .filter(type => type && type.trim() !== '');
  return [...new Set(types)].sort();
});

// Filter products based on search and filters
const filteredProducts = computed(() => {
  let filtered = productsSorted.value;

  // Search filter
  if (searchTerm.value.trim() !== '') {
    const search = searchTerm.value.toLowerCase();
    filtered = filtered.filter(p => 
      p.name?.toLowerCase().includes(search) ||
      p.brand?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search)
    );
  }

  // Brand filter
  if (selectedBrand.value !== '') {
    filtered = filtered.filter(p => p.brand === selectedBrand.value);
  }

  // Type filter
  if (selectedType.value !== '') {
    filtered = filtered.filter(p => p.category === selectedType.value);
  }

  // Price range filter
  if (selectedPriceRange.value !== '') {
    const range = selectedPriceRange.value;
    filtered = filtered.filter(p => {
      const price = p.price || 0;
      if (range === '0-50') return price >= 0 && price <= 50;
      if (range === '50-100') return price > 50 && price <= 100;
      if (range === '100-200') return price > 100 && price <= 200;
      if (range === '200-500') return price > 200 && price <= 500;
      if (range === '500+') return price > 500;
      return true;
    });
  }

  return filtered;
});

function handleStockUpdate(payload) {
  const id = payload?.productId;
  const stock = payload?.stock;
  if (!id) return;
  const idx = products.value.findIndex(p => (p._id || p.id || p.productId) === id);
  if (idx !== -1) {
    products.value[idx] = { ...products.value[idx], stock };
  }
}

onMounted(async () => {
  try {
    const res = await api.get("/products");
    products.value = res.data;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
  socket.on('stock:update', handleStockUpdate);
});

onBeforeUnmount(() => {
  socket.off('stock:update', handleStockUpdate);
  socket.close();
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
  color: #4247c1;
}

.search-filters {
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
}

.search-bar {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  color: #1c1c29;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 1rem;
  border: 1px solid #1c1c29;
  border-radius: 6px;
  box-sizing: border-box;
  color: #1c1c29;
  background: #ffffff;
}

.search-input:focus {
  outline: none;
  border-color: #1c1c29;
  box-shadow: 0 0 0 2px rgba(28, 28, 41, 0.1);
}

.search-bar:focus-within .icon {
  color: #4247c1;
}

.search-input::placeholder {
  color: #999;
}

.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-select {
  width: 200px;
  padding: 10px 14px;
  font-size: 0.95rem;
  border: 1px solid #1c1c29;
  border-radius: 6px;
  background: #ffffff;
  color: #1c1c29;
  cursor: pointer;
  box-sizing: border-box;
}

.filter-select:focus {
  outline: none;
  border-color: #1c1c29;
  box-shadow: 0 0 0 2px rgba(28, 28, 41, 0.1);
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 1.1rem;
}

@import "../assets/products.css";
</style>
