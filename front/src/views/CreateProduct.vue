<template>
  <div class="create-page">
    <h2>Crear Producto</h2>
    <form @submit.prevent="onSubmit" class="create-form">
      <label>Nombre</label>
      <input v-model="name" required />

      <label>Marca</label>
      <input v-model="brand" />

      <label>Precio</label>
      <input v-model.number="price" type="number" required />

      <label>Descripción</label>
      <textarea v-model="description"></textarea>

      <label>Categoría</label>
      <input v-model="category" />

      <label>Stock</label>
      <input v-model.number="stock" type="number" />

      <label>Imagen</label>
      <input type="file" @change="onFileChange" accept="image/*" />

      <button type="submit">Crear</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="msg" class="success">{{ msg }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useUserStore } from "../stores/userStore";

const name = ref("");
const brand = ref("");
const price = ref(0);
const description = ref("");
const category = ref("");
const stock = ref(0);
const imageFile = ref(null);
const error = ref(null);
const msg = ref(null);
const router = useRouter();
const userStore = useUserStore();

function onFileChange(e) {
  const file = e.target.files[0];
  if (file) imageFile.value = file;
}

// extra guard in component as well
if (!userStore.token || userStore.user?.role !== "admin") {
  router.push("/products");
}

async function onSubmit() {
  error.value = null;
  msg.value = null;
  try {
    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("brand", brand.value);
    formData.append("price", price.value);
    formData.append("description", description.value);
    formData.append("category", category.value);
    formData.append("stock", stock.value);
    if (imageFile.value) formData.append("image", imageFile.value);

    const res = await api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    msg.value = "Producto creado correctamente";
    setTimeout(() => router.push("/products"), 1000);
  } catch (err) {
    error.value = err.response?.data?.message || "Error al crear producto";
  }
}
</script>

<style scoped>
.create-page {
  max-width: 720px;
  margin: 2rem auto;
  padding: 1rem;
}
.create-form {
  display: grid;
  gap: 0.6rem;
}
label {
  color: var(--primary-color);
}
input,
textarea {
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  background: #111;
  color: #fff;
}
button {
  margin-top: 0.6rem;
  padding: 0.6rem 1rem;
  background: var(--primary-color);
  color: #000;
  border: none;
  border-radius: 6px;
}
.error {
  color: #ff6b6b;
}
.success {
  color: #7efc9a;
}
</style>
