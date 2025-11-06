<template>
  <nav class="navbar">
    <RouterLink to="/products" class="logo-link">
      <img :src="logoUrl" alt="GeekLab" class="logo" />
    </RouterLink>
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
      <RouterLink to="/forum" class="nav-link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Foro GeekLab
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
        <Transition name="badge-bounce">
          <span v-if="itemCount" class="cart-badge" :key="itemCount">{{ itemCount }}</span>
        </Transition>
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
      @updateQuantity="updateQuantityDirect"
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
import logoUrl from "../assets/geeklab-logo.png";

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
  const result = cartStore.updateQuantity(item._id, item.quantity + 1);
  if (result.success && result.quantity < item.quantity + 1) {
    // La cantidad fue limitada por el stock
    alert(`No hay suficiente stock. Disponible: ${item.stock ?? 0} unidades`);
  }
}

function decreaseQuantity(item) {
  cartStore.updateQuantity(item._id, item.quantity - 1);
}

function updateQuantityDirect(item, quantity) {
  const result = cartStore.updateQuantity(item._id, quantity);
  if (result.success && result.quantity < quantity) {
    // La cantidad fue limitada por el stock
    alert(`No hay suficiente stock. Disponible: ${item.stock ?? 0} unidades`);
  }
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

.logo-link {
  display: flex;
  align-items: center;
  margin-right: 2rem;
  text-decoration: none;
}

.logo {
  height: 40px;
  width: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1c1c29;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(66, 71, 193, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  background: #f0f0f5;
  color: #4247c1;
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 71, 193, 0.15);
}

.nav-link:hover .icon {
  transform: scale(1.15) rotate(5deg);
}

.nav-link.router-link-active {
  color: #4247c1;
  font-weight: 500;
  background: rgba(66, 71, 193, 0.1);
}

.nav-link.router-link-active .icon {
  transform: scale(1.1);
}

.icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  color: #1c1c29;
}

.cart-icon:hover {
  background: #f0f0f5;
  color: #4247c1;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 8px rgba(66, 71, 193, 0.15);
}

.cart-icon:hover .icon {
  transform: scale(1.2) rotate(-10deg);
  animation: cartShake 0.5s ease;
}

@keyframes cartShake {
  0%, 100% {
    transform: scale(1.2) rotate(-10deg);
  }
  25% {
    transform: scale(1.2) rotate(-15deg);
  }
  75% {
    transform: scale(1.2) rotate(-5deg);
  }
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

.badge-bounce-enter-active {
  animation: badgeBounce 0.5s ease;
}

.badge-bounce-leave-active {
  transition: opacity 0.3s ease;
}

.badge-bounce-leave-to {
  opacity: 0;
}

@keyframes badgeBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.logout-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(66, 71, 193, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.logout-btn:hover::before {
  width: 200px;
  height: 200px;
}

.logout-btn:hover {
  background: #f0f0f5;
  border-color: #4247c1;
  color: #4247c1;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 71, 193, 0.15);
}

.logout-btn:hover .icon {
  transform: translateX(3px) scale(1.1);
}

.user-menu {
  display: inline-block;
}
</style>
