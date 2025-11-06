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
        <div class="rating" v-if="product.numReviews >= 0">
          <span class="stars" :title="averageRatingLabel">
            <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(product.averageRating || 0) }">★</span>
          </span>
          <span class="rating-text">{{ (product.averageRating || 0).toFixed(1) }} / 5 ({{ product.numReviews || 0 }})</span>
        </div>
        <div class="stock-section">
          <p class="stock" :class="{ 'low-stock': (product.stock ?? 0) <= 5, 'out-of-stock': (product.stock ?? 0) <= 0 }">
            Stock disponible: {{ product.stock ?? 0 }}
          </p>
          
          <!-- Admin stock management when out of stock -->
          <div v-if="isAdmin && (product.stock ?? 0) <= 0" class="admin-stock-controls">
            <h4>Gestión de Stock (Admin)</h4>
            <div class="stock-form">
              <label for="newStock">Cantidad de stock a añadir:</label>
              <input 
                id="newStock" 
                type="number" 
                v-model.number="newStock" 
                min="1" 
                placeholder="Ej: 10"
                class="stock-input"
              />
              <div class="stock-buttons">
                <button class="add-stock-btn" @click="addStock" :disabled="!newStock || newStock <= 0">
                  Añadir Stock
                </button>
                <button class="delete-product-btn" @click="confirmDelete" :disabled="isDeleting">
                  Eliminar Producto
                </button>
              </div>
              <div v-if="stockError" class="error">{{ stockError }}</div>
            </div>
          </div>
        </div>

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
          <button 
            class="add-to-cart" 
            :class="{ 'animating': isAddingToCart }"
            @click="addToCart"
          >
            <span v-if="!isAddingToCart">Añadir al carrito</span>
            <span v-else>¡Agregado!</span>
          </button>
        </div>

      <div class="section reviews">
        <h3>Reseñas</h3>
        <div v-if="(product.reviews?.length || 0) === 0" class="muted">Aún no hay reseñas.</div>
        <ul v-else class="review-list">
          <li v-for="r in product.reviews" :key="r._id || r.createdAt" class="review-item">
            <div class="review-header">
              <strong>{{ r.username }}</strong>
              <span class="review-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= r.rating }">★</span>
              </span>
              <span class="review-date">{{ formatDate(r.createdAt) }}</span>
            </div>
            <div class="review-comment">{{ r.comment }}</div>
          </li>
        </ul>

        <div class="review-form">
          <h4>Escribe tu reseña</h4>
          <div class="form-row">
            <label>Calificación</label>
            <div class="star-rating-input">
              <span 
                v-for="i in 5" 
                :key="i" 
                class="star-input" 
                :class="{ filled: i <= newRating, hover: i <= hoverRating }"
                @click="newRating = i"
                @mouseenter="hoverRating = i"
                @mouseleave="hoverRating = 0"
              >★</span>
              <span class="rating-label">{{ newRating }} de 5</span>
            </div>
          </div>
          <div class="form-row">
            <label for="comment">Comentario</label>
            <textarea id="comment" v-model="newComment" rows="3" placeholder="Cuéntanos tu experiencia..."></textarea>
          </div>
          <button class="submit-review" @click="submitReview" :disabled="!canSubmitReview">Enviar reseña</button>
          <div v-if="reviewError" class="error">{{ reviewError }}</div>
        </div>
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
import { useUserStore } from '../stores/userStore';
import { useToast } from '../composables/useToast';
import { io } from 'socket.io-client';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();
const { showToast } = useToast();
const product = ref(null);
const loading = ref(true);
const notFound = ref(false);
const isAddingToCart = ref(false);
const socket = io('http://localhost:4000');
const newStock = ref(1);
const stockError = ref(null);
const isDeleting = ref(false);

const newRating = ref(5);
const hoverRating = ref(0);
const newComment = ref('');
const reviewError = ref(null);
const averageRatingLabel = computed(() => `${(product.value?.averageRating || 0).toFixed(1)} de 5`);

const canSubmitReview = computed(() => newComment.value.trim().length > 0 && newRating.value >= 1 && newRating.value <= 5);

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
const isAdmin = computed(() => userStore.user?.role === 'admin');

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
  if (!product.value) return;
  
  // Animación
  isAddingToCart.value = true;
  setTimeout(() => {
    isAddingToCart.value = false;
  }, 600);
  
  // Agregar al carrito
  cartStore.addToCart(product.value);
  
  // Mostrar toast
  showToast(`¡${product.value.name} agregado al carrito!`, 'success', 2000);
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
}

async function submitReview() {
  reviewError.value = null;
  if (!canSubmitReview.value) {
    reviewError.value = 'Completa la calificación y el comentario';
    return;
  }
  try {
    const id = route.params.id;
    const res = await api.post(`/products/${id}/reviews`, {
      rating: newRating.value,
      comment: newComment.value.trim(),
    });
    product.value = res.data;
    newComment.value = '';
    newRating.value = 5;
    showToast('¡Gracias por tu reseña!', 'success', 2000);
  } catch (e) {
    reviewError.value = e?.response?.data?.message || 'Error al enviar la reseña';
  }
}

async function addStock() {
  stockError.value = null;
  if (!newStock.value || newStock.value <= 0) {
    stockError.value = 'Ingresa una cantidad válida';
    return;
  }
  try {
    const id = route.params.id;
    const currentStock = product.value.stock || 0;
    const res = await api.put(`/products/${id}`, {
      ...product.value,
      stock: currentStock + newStock.value
    });
    product.value = res.data;
    newStock.value = 1;
    showToast(`Stock actualizado: ${res.data.stock} unidades`, 'success', 2000);
  } catch (e) {
    stockError.value = e?.response?.data?.message || 'Error al actualizar el stock';
  }
}

async function confirmDelete() {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
    return;
  }
  isDeleting.value = true;
  try {
    const id = route.params.id;
    await api.delete(`/products/${id}`);
    showToast('Producto eliminado correctamente', 'success', 2000);
    router.push('/products');
  } catch (e) {
    stockError.value = e?.response?.data?.message || 'Error al eliminar el producto';
    isDeleting.value = false;
  }
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
.rating { display:flex; align-items:center; gap:8px; margin: 6px 0 10px; }
.stars { color: #e0e0e0; }
.star { font-size: 18px; line-height: 1; }
.star.filled { color: #f5b50a; }
.rating-text { color:#1c1c29; opacity:0.8; font-size: 0.95rem; }
.stock-section { margin: 8px 0; }
.stock { color:#30a84a; margin: 8px 0; font-weight: 500; }
.stock.low-stock { color: #ff6b6b; }
.stock.out-of-stock { color: #ff6b6b; font-weight: 600; }
.admin-stock-controls {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
.admin-stock-controls h4 {
  margin: 0 0 12px;
  color: #4247c1;
  font-size: 1rem;
}
.stock-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.stock-form label {
  color: #1c1c29;
  font-weight: 500;
  font-size: 0.9rem;
}
.stock-input {
  border: 1px solid #1c1c29;
  border-radius: 6px;
  padding: 10px;
  background: #fff;
  color: #1c1c29;
  font-size: 1rem;
}
.stock-input:focus {
  outline: none;
  border-color: #4247c1;
  box-shadow: 0 0 0 2px rgba(66,71,193,0.1);
}
.stock-buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.add-stock-btn {
  background: #30a84a;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s;
  flex: 1;
}
.add-stock-btn:hover:not(:disabled) {
  background: #278a3d;
  transform: translateY(-1px);
}
.add-stock-btn:disabled {
  background: #cccccc;
  color: #666;
  cursor: not-allowed;
}
.delete-product-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s;
  flex: 1;
}
.delete-product-btn:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-1px);
}
.delete-product-btn:disabled {
  background: #cccccc;
  color: #666;
  cursor: not-allowed;
}
.error {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 4px;
}
.section {
  margin: 16px 0;
}
.reviews { margin-top: 24px; }
.review-list { list-style:none; padding:0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 12px; }
.review-item { border:1px solid #e0e0e0; border-radius:8px; padding: 12px; background:#fff; }
.review-header { display:flex; align-items:center; gap:10px; }
.review-stars { color:#f5b50a; margin-left: auto; }
.review-date { color:#1c1c29; opacity:0.6; font-size:0.85rem; }
.review-comment { margin-top: 6px; color:#1c1c29; }
.review-form { margin-top: 16px; border-top:1px solid #e0e0e0; padding-top:12px; }
.review-form h4 { margin: 0 0 10px; color:#4247c1; }
.review-form .form-row { display:flex; flex-direction: column; gap:6px; margin-bottom:10px; }
.review-form textarea { border:1px solid #1c1c29; border-radius:6px; padding:10px; background:#fff; color:#1c1c29; }
.review-form textarea:focus { outline:none; border-color:#4247c1; box-shadow:0 0 0 2px rgba(66,71,193,0.1); }
.star-rating-input { display: flex; align-items: center; gap: 8px; }
.star-input { font-size: 28px; line-height: 1; color: #e0e0e0; cursor: pointer; transition: color 0.2s, transform 0.1s; user-select: none; }
.star-input:hover { transform: scale(1.1); }
.star-input.filled { color: #f5b50a; }
.star-input.hover { color: #ffd700; }
.rating-label { color: #1c1c29; opacity: 0.8; font-size: 0.95rem; margin-left: 4px; }
.submit-review { background:#4247c1; color:#fff; border:none; padding:10px 16px; border-radius:6px; cursor:pointer; transition:0.2s; }
.submit-review:disabled { background:#cccccc; color:#666; cursor:not-allowed; }
.submit-review:hover:not(:disabled) { background:#3539a0; transform: translateY(-1px); }
.muted { color:#1c1c29; opacity:0.6; }
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
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.add-to-cart:hover:not(.animating) {
  background: #3539a0;
  transform: translateY(-1px);
}
.add-to-cart.animating {
  background: #7efc9a;
  color: #1c1c29;
  animation: addToCartPulse 0.6s ease;
}
@keyframes addToCartPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
  }
}
</style>
