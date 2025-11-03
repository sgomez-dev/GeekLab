<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Registro</h2>
      <form @submit.prevent="onSubmit">
        <label for="username">Nombre de usuario</label>
        <input v-model="username" type="text" required />
        <label for="email">Email</label>
        <input v-model="email" type="email" required />
        <label for="password">Contraseña</label>
        <input v-model="password" type="password" required />
        <button type="submit">Registrarse</button>
      </form>
      <p>
        ¿Ya tienes una cuenta?
        <RouterLink to="/login">Inicia sesión</RouterLink>
      </p>
      <p v-if="msg" class="success">{{ msg }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";

const username = ref("");
const email = ref("");
const password = ref("");
const error = ref(null);
const msg = ref(null);
const router = useRouter();
const userStore = useUserStore();

async function onSubmit() {
  error.value = null;
  msg.value = null;
  try {
    await userStore.register(username.value, email.value, password.value);
    msg.value = "Registro exitoso. Redirigiendo al inicio de sesión...";
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err) {
    error.value = err.response?.data?.message || "Error al registrarse.";
  }
}
</script>

<style scoped>
/* Reusar estilos del login */
.auth-page {
  background: #0b0b0b;
  min-height: 100vh;
  color: #fff;
  padding: 2rem;
}
.auth-card {
  max-width: 420px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #111;
  border-radius: 10px;
}
label {
  display: block;
  margin-top: 0.7rem;
  font-size: 0.9rem;
}
input {
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.3rem;
  background: #222;
  border: none;
  color: #fff;
  border-radius: 6px;
}
button {
  margin-top: 1rem;
  width: 100%;
  padding: 0.7rem;
  border-radius: 6px;
  background: #0ff;
  color: #000;
  border: none;
  cursor: pointer;
}
.error {
  color: #ff6b6b;
  margin-top: 0.6rem;
}
.success {
  color: #7efc9a;
  margin-top: 0.6rem;
}
</style>
