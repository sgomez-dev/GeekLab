<template>
  <div v-if="!removed" class="product-card" :class="{ 'out-of-stock': isOutOfStock, 'admin-enabled': isAdmin }">
    <div v-if="isOutOfStock" class="out-of-stock-overlay">
      <div class="overlay-content">
        <span class="out-of-stock-text">Fuera de Stock</span>
        <div v-if="isAdmin" class="overlay-actions">
          <button class="btn-small add" @click="openAddStockModal">Agregar stock</button>
          <button class="btn-small delete" @click="openDeleteModal" :disabled="isDeleting">Eliminar</button>
        </div>
      </div>
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
      <div class="product-rating" v-if="product.numReviews >= 0">
        <span class="product-stars">
          <span v-for="i in 5" :key="i" class="product-star" :class="{ filled: i <= Math.round(product.averageRating || 0) }">★</span>
        </span>
        <span class="product-rating-text" v-if="product.numReviews > 0">{{ (product.averageRating || 0).toFixed(1) }}</span>
      </div>
      <p class="product-stock" :class="{ 'low-stock': (localStock ?? 0) <= 5 }">Stock: {{ localStock ?? 0 }}</p>
      <button 
        class="add-to-cart" 
        :class="{ 'animating': isAnimating }"
        @click="addToCart" 
        :disabled="isOutOfStock"
      >
        <span v-if="!isAnimating">Añadir al carrito</span>
        <span v-else>¡Agregado!</span>
      </button>
    </div>
  </div>
  <!-- Modal de confirmación eliminar -->
  <div v-if="showDeleteModal" class="modal-backdrop">
    <div class="modal">
      <h4>Eliminar producto</h4>
      <p>¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.</p>
      <div class="modal-actions">
        <button class="btn" @click="closeDeleteModal" :disabled="isDeleting">Cancelar</button>
        <button class="btn danger" @click="confirmDelete" :disabled="isDeleting">{{ isDeleting ? 'Eliminando...' : 'Eliminar' }}</button>
      </div>
    </div>
  </div>

  <!-- Modal de Agregar stock -->
  <div v-if="showAddStockModal" class="modal-backdrop">
    <div class="modal">
      <h4>Agregar stock</h4>
      <p>Ingresa la cantidad a añadir al stock actual.</p>
      <div class="modal-field">
        <input type="number" min="1" v-model.number="addStockQty" class="stock-input-small" placeholder="Cantidad" />
      </div>
      <div class="modal-actions">
        <button class="btn" @click="closeAddStockModal" :disabled="isAddingStock">Cancelar</button>
        <button class="btn" @click="confirmAddStock" :disabled="isAddingStock || !addStockQty || addStockQty <= 0">{{ isAddingStock ? 'Guardando...' : 'Añadir' }}</button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { computed, ref, watch } from "vue";
const emit = defineEmits(['deleted']);
import { useCartStore } from "../stores/cartStore";
import { RouterLink } from 'vue-router';
import { useToast } from "../composables/useToast";
import { useUserStore } from "../stores/userStore";
import api from "../api/axios";

const props = defineProps({
  product: { type: Object, required: true },
});

const cartStore = useCartStore();
const userStore = useUserStore();
const { showToast } = useToast();
const isAnimating = ref(false);

const productId = computed(() => props.product._id || props.product.id || props.product.productId);

const imageUrl = computed(() => {
  if (!props.product.image) return "/placeholder.png";
  if (props.product.image.startsWith("http")) return props.product.image;
  return `http://localhost:4000${props.product.image}`;
});

const localStock = ref(props.product.stock ?? 0);
watch(() => props.product.stock, (v) => { localStock.value = v ?? 0; });

const isOutOfStock = computed(() => {
  return (localStock.value ?? 0) <= 0;
});

const isAdmin = computed(() => userStore.user?.role === 'admin');
const newStock = ref(1);
const isDeleting = ref(false);
const showDeleteModal = ref(false);
const showAddStockModal = ref(false);
const addStockQty = ref(1);
const isAddingStock = ref(false);
const removed = ref(false);
const errorMsg = ref(null);

function handleImageError(e) {
  e.target.src = "/placeholder.png";
}

function addToCart() {
  if (isOutOfStock.value) return;
  
  // Animación del botón
  isAnimating.value = true;
  setTimeout(() => {
    isAnimating.value = false;
  }, 600);
  
  // Agregar al carrito
  cartStore.addToCart(props.product);
  
  // Mostrar toast
  showToast(`¡${props.product.name} agregado al carrito!`, 'success', 2000);
}

async function addStock() {
  errorMsg.value = null;
  try {
    const id = productId.value;
    const res = await api.put(`/products/${id}`, {
      ...props.product,
      stock: (localStock.value || 0) + newStock.value,
    });
    localStock.value = res.data.stock || 0;
    newStock.value = 1;
    showToast(`Stock actualizado: ${localStock.value}`, 'success', 2000);
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || 'Error al actualizar stock';
  }
}

function openAddStockModal() {
  addStockQty.value = 1;
  showAddStockModal.value = true;
}

function closeAddStockModal() {
  showAddStockModal.value = false;
}

async function confirmAddStock() {
  if (!addStockQty.value || addStockQty.value <= 0) return;
  isAddingStock.value = true;
  newStock.value = addStockQty.value;
  await addStock();
  isAddingStock.value = false;
  closeAddStockModal();
}

function openDeleteModal() {
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
}

async function confirmDelete() {
  isDeleting.value = true;
  errorMsg.value = null;
  try {
    const id = productId.value;
    await api.delete(`/products/${id}`);
    showToast('Producto eliminado', 'success', 2000);
    emit('deleted', id);
    removed.value = true;
    closeDeleteModal();
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || 'Error al eliminar';
    isDeleting.value = false;
  }
}
</script>

<style>
@import "../assets/products.css";
</style>
