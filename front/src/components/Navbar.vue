<template>
  <nav class="navbar">
    <h1>GeekLab</h1>
    <div>
      <RouterLink to="/products">Productos</RouterLink>
      <RouterLink to="/chat">Chat</RouterLink>
      <RouterLink v-if="!user" to="/login">Iniciar sesión</RouterLink>
      <button v-else @click="logout">Cerrar sesión</button>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from "../stores/userStore";
import { RouterLink, useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();
const user = userStore.user;

function logout() {
  userStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #0e0e0e;
  color: white;
}
a {
  color: #0ff;
  text-decoration: none;
  margin: 0 0.5rem;
}
button {
  background: #222;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}
</style>
