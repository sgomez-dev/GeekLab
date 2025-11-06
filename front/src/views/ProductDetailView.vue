<template>
  <div class="product-detail">
    <div class="toolbar">
      <button class="back" @click="goBack">← Atrás</button>
    </div>
    <div v-if="loading" class="container">
      Cargando...
    </div>
    <div v-else-if="notFound" class="container">
      <h2>Producto no encontrado</h2>
      <p>Verifica que el producto exista o vuelve al catálogo.</p>
      <RouterLink to="/products">Volver al catálogo</RouterLink>
    </div>
    <div class="container" v-else-if="product">
      <div class="media">
        <img :src="imageUrl" :alt="product.name" @error="onError" />
      </div>
      <div class="info">
        <h2>{{ product.name }}</h2>
        <p class="brand">{{ product.brand }}</p>
        <p class="price">€{{ product.price?.toFixed(2) }}</p>
        <p class="stock" :class="{ 'low-stock': (product.stock ?? 0) <= 5 }">Stock disponible: {{ product.stock ?? 0 }}</p>

        <div v-if="product.description" class="section">
          <h3>Descripción</h3>
          <p>{{ product.description }}</p>
        </div>

        <div v-if="hasSpecs" class="section">
          <h3>Especificaciones</h3>
          <ul class="specs">
            <li v-for="(val, key) in specsList" :key="key">
              <span class="spec-key">{{ key }}</span>
              <span class="spec-val">{{ val }}</span>
            </li>
          </ul>
        </div>

        <div class="actions">
          <button class="add-to-cart" @click="addToCart">Añadir al carrito</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import api from '../api/axios';
import { useCartStore } from '../stores/cartStore';
import { io } from 'socket.io-client';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const product = ref(null);
const loading = ref(true);
const notFound = ref(false);
const socket = io('http://localhost:4000');

const imageUrl = computed(() => {
  if (!product.value?.image) return '/placeholder.png';
  if (product.value.image.startsWith('http')) return product.value.image;
  return `http://localhost:4000${product.value.image}`;
});

const specsList = computed(() => {
  const specs = product.value?.specifications || product.value?.specs || {};
  return specs;
});

const hasSpecs = computed(() => !!product.value && Object.keys(specsList.value).length > 0);

function onError(e) {
  e.target.src = '/placeholder.png';
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/products');
}

function handleStockUpdate(payload) {
  const id = payload?.productId;
  if (product.value && (product.value._id || product.value.id) === id) {
    product.value = { ...product.value, stock: payload.stock };
  }
}

async function load() {
  loading.value = true;
  notFound.value = false;
  try {
    const id = route.params.id;
    console.log('Loading product id:', id);
    const res = await api.get(`/products/${id}`);
    product.value = res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      notFound.value = true;
    } else {
      console.error('Error cargando producto:', err);
    }
  } finally {
    loading.value = false;
  }
}

function addToCart() {
  if (product.value) cartStore.addToCart(product.value);
}

onMounted(() => {
  load();
  socket.on('stock:update', handleStockUpdate);
});

onBeforeUnmount(() => {
  socket.off('stock:update', handleStockUpdate);
  socket.close();
});
</script>

<style scoped>
.product-detail {
  color: #1c1c29;
  background: #ffffff;
}
.toolbar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.back {
  background: #f0f0f5;
  color: #1c1c29;
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.back:hover {
  background: #4247c1;
  color: #ffffff;
  border-color: #4247c1;
}
.back-link { color: #4247c1; text-decoration: none; }
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.media {
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.media img {
  max-width: 100%;
  max-height: 420px;
  object-fit: contain;
}
.info h2 {
  margin: 0 0 8px;
  color: #4247c1;
}
.brand {
  color: #1c1c29;
  opacity: 0.7;
  margin: 0 0 12px;
}
.price {
  color: var(--primary-color);
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0 0 16px;
}
.stock { color:#7efc9a; margin: 8px 0; font-weight: 500; }
.stock.low-stock { color: #ff6b6b; }
.section {
  margin: 16px 0;
}
.section h3 {
  color: #4247c1;
  margin-bottom: 8px;
}
.specs {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}
.specs li {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}
.spec-key {
  color: #1c1c29;
  opacity: 0.7;
}
.spec-val {
  color: #1c1c29;
}
.actions {
  margin-top: 20px;
}
.add-to-cart {
  background: var(--primary-color);
  color: #ffffff;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.add-to-cart:hover {
  background: #3539a0;
  transform: translateY(-1px);
}
@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
  }
}
</style>
