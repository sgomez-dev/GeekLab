<template>
  <nav class="navbar">
    <h1>GeekLab</h1>
    <div class="nav-links">
      <RouterLink to="/products" class="nav-link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Productos
      </RouterLink>
      <RouterLink v-if="user?.role === 'admin'" to="/products/create" class="nav-link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Crear producto
      </RouterLink>
      <RouterLink to="/chat" class="nav-link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Chat
      </RouterLink>
      <RouterLink v-if="user" to="/account" class="nav-link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        Mi cuenta
      </RouterLink>

      <div class="cart-icon" @click="toggleCart">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span v-if="itemCount" class="cart-badge">{{ itemCount }}</span>
      </div>

      <RouterLink v-if="!user" to="/login" class="nav-link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
        Iniciar sesión
      </RouterLink>
      <div v-else class="user-menu">
        <button @click="logout" class="logout-btn">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>

    <CartModal
      v-if="showCart"
      :items="cartItems"
      :total="total"
      @close="showCart = false"
      @increase="increaseQuantity"
      @decrease="decreaseQuantity"
      @checkout="checkout"
    />

    <AlertModal
      v-if="showSuccess"
      :message="'¡Compra realizada con éxito! Gracias por tu compra.'"
      @confirm="showSuccess = false"
    />
  </nav>
</template>

<script setup>
import { useUserStore } from "../stores/userStore";
import { useCartStore } from "../stores/cartStore";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import CartModal from "./CartModal.vue";
import AlertModal from "./AlertModal.vue";

const userStore = useUserStore();
const cartStore = useCartStore();
const router = useRouter();
const showCart = ref(false);
const showSuccess = ref(false);

const user = computed(() => userStore.user);
const cartItems = computed(() => cartStore.items);
const total = computed(() => cartStore.total);
const itemCount = computed(() => cartStore.itemCount);

function logout() {
  userStore.logout();
  router.push("/login");
}

function toggleCart() {
  showCart.value = !showCart.value;
}

function getImageUrl(product) {
  if (!product.image) return "/placeholder.png";
  if (product.image.startsWith("http")) return product.image;
  return `http://localhost:4000${product.image}`;
}

function increaseQuantity(item) {
  cartStore.updateQuantity(item._id, item.quantity + 1);
}

function decreaseQuantity(item) {
  cartStore.updateQuantity(item._id, item.quantity - 1);
}

async function checkout() {
  try {
    const result = await cartStore.checkout();
    if (result.success) {
      showCart.value = false;
      showSuccess.value = true;
    } else {
      if (result.details && result.details.length > 0) {
        const stockErrors = result.details
          .map(
            (d) =>
              `${d.product}: solicitado ${d.requested}, disponible ${d.available}`
          )
          .join("\n");
        alert(`Error: Stock insuficiente\n${stockErrors}`);
      } else {
        alert(result.error || "Error al procesar la compra");
      }
    }
  } catch (error) {
    alert("Error al procesar la compra");
    console.error("Error:", error);
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background: #ffffff;
  color: #1c1c29;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  box-sizing: border-box;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-left: auto;
}

h1 {
  margin: 0;
  margin-right: 2rem;
  color: #4247c1;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1c1c29;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f0f0f5;
  color: #4247c1;
  text-decoration: none;
}

.nav-link.router-link-active {
  color: #4247c1;
  font-weight: 500;
}

.icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.cart-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
  color: #1c1c29;
}

.cart-icon:hover {
  background: #f0f0f5;
  color: #4247c1;
}

.cart-badge {
  background: #4247c1;
  color: #ffffff;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  position: absolute;
  top: -2px;
  right: -2px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: #1c1c29;
  border: 1px solid #e0e0e0;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #f0f0f5;
  border-color: #4247c1;
  color: #4247c1;
}

.user-menu {
  display: inline-block;
}
</style>
