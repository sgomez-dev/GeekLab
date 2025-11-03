<template>
  <nav class="navbar">
    <h1>GeekLab</h1>
    <div class="nav-links">
      <RouterLink to="/products">Productos</RouterLink>
      <RouterLink v-if="user?.role === 'admin'" to="/products/create">
        Crear producto
      </RouterLink>
      <RouterLink to="/chat">Chat</RouterLink>
      <RouterLink v-if="!user" to="/login">Iniciar sesión</RouterLink>
      <div v-else class="user-menu">
        <button @click="logout">Cerrar sesión ({{ user?.username }})</button>
      </div>
      <div class="cart-icon" @click="toggleCart">
        🛒 <span v-if="itemCount" class="cart-badge">{{ itemCount }}</span>
      </div>
    </div>

    <!-- Cart dropdown -->
    <div v-if="showCart" class="cart-summary">
      <h3>Carrito</h3>
      <div v-if="cartItems.length === 0" class="empty-cart">
        El carrito está vacío
      </div>
      <div v-else>
        <div v-for="item in cartItems" :key="item._id" class="cart-item">
          <img :src="getImageUrl(item)" :alt="item.name" />
          <div class="cart-item-info">
            <h4 class="cart-item-name">{{ item.name }}</h4>
            <p class="cart-item-price">€{{ item.price }}</p>
          </div>
          <div class="cart-quantity">
            <button @click="decreaseQuantity(item)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="increaseQuantity(item)">+</button>
          </div>
        </div>
        <div class="cart-total">Total: €{{ total.toFixed(2) }}</div>
        <button class="checkout-button" @click="checkout">
          Proceder al pago
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from "../stores/userStore";
import { useCartStore } from "../stores/cartStore";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";

const userStore = useUserStore();
const cartStore = useCartStore();
const router = useRouter();
const showCart = ref(false);

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
      alert("¡Compra realizada con éxito!");
      showCart.value = false;
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
  padding: 1rem;
  background: #0e0e0e;
  color: white;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

h1 {
  margin: 0;
  margin-right: 2rem;
}

.cart-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 1rem;
}

a {
  color: #0ff;
  text-decoration: none;
}

button {
  background: #222;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.user-menu {
  display: inline-block;
}
</style>
