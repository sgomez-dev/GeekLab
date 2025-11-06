<template>
  <div class="auth-page">
    <VantaBackground />
    <div class="auth-card">
      <h2>Iniciar sesión</h2>
      <form @submit.prevent="onSubmit">
        <label for="email">Email</label>
        <input v-model="email" type="email" required />
        <label for="password">Contraseña</label>
        <input v-model="password" type="password" required />
        <button type="submit">Ingresar</button>
      </form>
      <p>
        ¿No tienes una cuenta?
        <RouterLink to="/register">Regístrate</RouterLink>
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import VantaBackground from "../components/VantaBackground.vue";

const email = ref("");
const password = ref("");
const error = ref(null);
const router = useRouter();
const userStore = useUserStore();

async function onSubmit() {
  error.value = null;
  try {
    await userStore.login(email.value, password.value);
    router.push("/products");
  } catch (err) {
    error.value = err.response?.data?.message || "Error al iniciar sesión.";
  }
}
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  color: #1c1c29;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.auth-card {
  position: relative;
  z-index: 20;
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(224, 224, 224, 0.5);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
h2 {
  color: #4247c1;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}
label {
  display: block;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #1c1c29;
  font-weight: 500;
}
input {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: #ffffff;
  border: 1px solid #1c1c29;
  color: #1c1c29;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: all 0.2s;
}
input:focus {
  outline: none;
  border-color: #4247c1;
  box-shadow: 0 0 0 2px rgba(66, 71, 193, 0.1);
}
button {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  background: #4247c1;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
}
button:hover {
  background: #3539a0;
  transform: translateY(-1px);
}
p {
  margin-top: 1rem;
  text-align: center;
  color: #1c1c29;
}
a {
  color: #4247c1;
  text-decoration: none;
  font-weight: 500;
}
a:hover {
  text-decoration: underline;
}
.error {
  color: #ff6b6b;
  margin-top: 0.6rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
