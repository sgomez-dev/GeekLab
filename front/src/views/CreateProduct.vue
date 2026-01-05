<template>
  <div class="create-page">
    <div class="toolbar">
      <button class="back" @click="goBack">← Atrás</button>
    </div>
    <h2>{{ isEditMode ? "Editar Producto" : "Crear Producto" }}</h2>
    <form @submit.prevent="onSubmit" class="create-form">
      <div class="form-group">
        <label for="name">Nombre <span class="required">*</span></label>
        <input
          id="name"
          type="text"
          v-model="name"
          required
          placeholder="Ej: Teclado Mecánico RGB"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="brand">Marca <span class="required">*</span></label>
          <div class="select-wrapper">
            <select id="brand" v-model="selectedBrand" @change="onBrandChange">
              <option value="">Seleccionar marca</option>
              <option v-for="b in availableBrands" :key="b" :value="b">
                {{ b }}
              </option>
              <option value="__new__">+ Crear nueva marca</option>
            </select>
          </div>
          <input
            v-if="selectedBrand === '__new__'"
            v-model="newBrand"
            class="new-input"
            placeholder="Nombre de la nueva marca"
            required
            @blur="addNewBrand"
          />
        </div>

        <div class="form-group">
          <label for="category"
            >Categoría <span class="required">*</span></label
          >
          <div class="select-wrapper">
            <select
              id="category"
              v-model="selectedCategory"
              @change="onCategoryChange"
            >
              <option value="">Seleccionar categoría</option>
              <option v-for="c in availableCategories" :key="c" :value="c">
                {{ c }}
              </option>
              <option value="__new__">+ Crear nueva categoría</option>
            </select>
          </div>
          <input
            v-if="selectedCategory === '__new__'"
            v-model="newCategory"
            class="new-input"
            placeholder="Nombre de la nueva categoría"
            required
            @blur="addNewCategory"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="price">Precio (€) <span class="required">*</span></label>
          <input
            id="price"
            v-model.number="price"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>

        <div class="form-group">
          <label for="stock">Stock <span class="required">*</span></label>
          <input
            id="stock"
            v-model.number="stock"
            type="number"
            min="0"
            required
            placeholder="0"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="description"
          >Descripción <span class="required">*</span></label
        >
        <textarea
          id="description"
          v-model="description"
          rows="4"
          required
          placeholder="Describe las características del producto..."
        ></textarea>
      </div>

      <div class="form-group">
        <label for="image"
          >Imagen <span class="required" v-if="!isEditMode">*</span></label
        >
        <div class="file-input-wrapper">
          <input
            id="image"
            type="file"
            @change="onFileChange"
            accept="image/*"
            class="file-input"
            :required="!isEditMode"
          />
          <label for="image" class="file-label">
            <svg
              class="file-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span v-if="!imageFile">{{
              isEditMode ? "Cambiar imagen (opcional)" : "Seleccionar imagen"
            }}</span>
            <span v-else class="file-name">{{ imageFile.name }}</span>
          </label>
        </div>
        <div v-if="imagePreview || currentImageUrl" class="image-preview">
          <img :src="imagePreview || currentImageUrl" alt="Preview" />
        </div>
      </div>

      <div class="form-actions">
        <div class="form-actions-left">
          <button
            v-if="isEditMode"
            type="button"
            class="btn-danger"
            @click="openDeleteModal"
            :disabled="isDeleting"
          >
            Eliminar Producto
          </button>
        </div>
        <div class="form-actions-right">
          <button type="button" class="btn-secondary" @click="goBack">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="!isFormValid">
            {{ isEditMode ? "Guardar Cambios" : "Crear Producto" }}
          </button>
        </div>
      </div>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="msg" class="success">{{ msg }}</p>
  </div>

  <!-- Modal de confirmación eliminar -->
  <div v-if="showDeleteModal" class="modal-backdrop">
    <div class="modal">
      <h4>Eliminar producto</h4>
      <p>
        ¿Seguro que quieres eliminar este producto? Esta acción no se puede
        deshacer.
      </p>
      <div class="modal-actions">
        <button class="btn" @click="closeDeleteModal" :disabled="isDeleting">
          Cancelar
        </button>
        <button
          class="btn danger"
          @click="confirmDelete"
          :disabled="isDeleting"
        >
          {{ isDeleting ? "Eliminando..." : "Eliminar" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../api/axios";
import { useUserStore } from "../stores/userStore";

const name = ref("");
const selectedBrand = ref("");
const newBrand = ref("");
const brand = computed(() =>
  selectedBrand.value === "__new__" ? newBrand.value : selectedBrand.value
);
const price = ref(0);
const description = ref("");
const selectedCategory = ref("");
const newCategory = ref("");
const category = computed(() =>
  selectedCategory.value === "__new__"
    ? newCategory.value
    : selectedCategory.value
);
const stock = ref(0);
const imageFile = ref(null);
const imagePreview = ref(null);
const currentImageUrl = ref(null);
const error = ref(null);
const msg = ref(null);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const products = ref([]);
const productId = ref(null);
const isEditMode = computed(() => !!productId.value);
const showDeleteModal = ref(false);
const isDeleting = ref(false);

const isFormValid = computed(() => {
  const resolvedBrand = brand.value?.trim();
  const resolvedCategory = category.value?.trim();
  return (
    name.value.trim() !== "" &&
    description.value.trim() !== "" &&
    resolvedBrand &&
    resolvedCategory &&
    price.value !== null &&
    price.value !== "" &&
    !Number.isNaN(Number(price.value)) &&
    stock.value !== null &&
    stock.value !== "" &&
    Number(stock.value) >= 0 &&
    (isEditMode.value || !!imageFile.value)
  );
});

const availableBrands = computed(() => {
  const brands = products.value
    .map((p) => p.brand)
    .filter((b) => b && b.trim() !== "");
  return [...new Set(brands)].sort();
});

const availableCategories = computed(() => {
  const categories = products.value
    .map((p) => p.category)
    .filter((c) => c && c.trim() !== "");
  return [...new Set(categories)].sort();
});

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push("/products");
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    imageFile.value = file;
    // Crear preview
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function onBrandChange() {
  if (selectedBrand.value !== "__new__") {
    newBrand.value = "";
  }
}

function onCategoryChange() {
  if (selectedCategory.value !== "__new__") {
    newCategory.value = "";
  }
}

function addNewBrand() {
  if (
    newBrand.value.trim() &&
    !availableBrands.value.includes(newBrand.value.trim())
  ) {
    // La marca se agregará automáticamente cuando se cree el producto
  }
}

function addNewCategory() {
  if (
    newCategory.value.trim() &&
    !availableCategories.value.includes(newCategory.value.trim())
  ) {
    // La categoría se agregará automáticamente cuando se cree el producto
  }
}

async function loadProducts() {
  try {
    const res = await api.get("/products");
    products.value = res.data;
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

async function loadProduct() {
  if (!productId.value) return;
  try {
    const res = await api.get(`/products/${productId.value}`);
    const p = res.data;
    name.value = p.name || "";
    selectedBrand.value = p.brand || "";
    selectedCategory.value = p.category || "";
    price.value = p.price || 0;
    stock.value = p.stock || 0;
    description.value = p.description || "";
    if (p.image) {
      currentImageUrl.value = p.image.startsWith("http")
        ? p.image
        : `http://localhost:4000${p.image}`;
    }
  } catch (error) {
    console.error("Error loading product:", error);
    error.value = "Error al cargar el producto";
  }
}

// extra guard in component as well
if (!userStore.token || userStore.user?.role !== "admin") {
  router.push("/products");
}

onMounted(async () => {
  await loadProducts();
  if (route.params.id) {
    productId.value = route.params.id;
    await loadProduct();
  }
});

async function onSubmit() {
  error.value = null;
  msg.value = null;

  // Validar que si se seleccionó "nuevo", se haya ingresado un valor
  if (selectedBrand.value === "__new__" && !newBrand.value.trim()) {
    error.value = "Por favor ingresa el nombre de la nueva marca";
    return;
  }

  if (selectedCategory.value === "__new__" && !newCategory.value.trim()) {
    error.value = "Por favor ingresa el nombre de la nueva categoría";
    return;
  }

  if (!description.value.trim()) {
    error.value = "La descripción es requerida";
    return;
  }
  if (name.value.trim() === "") {
    error.value = "El nombre es requerido";
    return;
  }
  if (!brand.value?.trim()) {
    error.value = "La marca es requerida";
    return;
  }
  if (!category.value?.trim()) {
    error.value = "La categoría es requerida";
    return;
  }
  if (
    price.value === null ||
    price.value === "" ||
    Number.isNaN(Number(price.value))
  ) {
    error.value = "El precio es requerido";
    return;
  }
  if (stock.value === null || stock.value === "" || Number(stock.value) < 0) {
    error.value = "El stock es requerido (0 o más)";
    return;
  }
  if (!isEditMode.value && !imageFile.value) {
    error.value = "La imagen es requerida";
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", name.value.trim());
    if (brand.value.trim()) formData.append("brand", brand.value.trim());
    formData.append("price", price.value);
    if (description.value.trim())
      formData.append("description", description.value.trim());
    if (category.value.trim())
      formData.append("category", category.value.trim());
    formData.append("stock", stock.value || 0);
    if (imageFile.value) formData.append("image", imageFile.value);

    if (isEditMode.value) {
      const res = await api.put(`/products/${productId.value}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      msg.value = "Producto actualizado correctamente";
      setTimeout(() => router.push(`/products/${productId.value}`), 1500);
    } else {
      const res = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      msg.value = "Producto creado correctamente";
      setTimeout(() => router.push("/products"), 1500);
    }
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      (isEditMode.value
        ? "Error al actualizar producto"
        : "Error al crear producto");
  }
}

function openDeleteModal() {
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
}

async function confirmDelete() {
  if (!productId.value) return;
  isDeleting.value = true;
  try {
    await api.delete(`/products/${productId.value}`);
    msg.value = "Producto eliminado correctamente";
    setTimeout(() => router.push("/products"), 1500);
  } catch (err) {
    error.value = err.response?.data?.message || "Error al eliminar producto";
    isDeleting.value = false;
    closeDeleteModal();
  }
}
</script>

<style scoped>
.create-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
}

h2 {
  color: #4247c1;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-align: center;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.back {
  background: #f0f0f5;
  color: #1c1c29;
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.back:hover {
  background: #4247c1;
  color: #ffffff;
  border-color: #4247c1;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #1c1c29;
  font-weight: 500;
  font-size: 0.95rem;
}

.required {
  color: #ff6b6b;
}

input[type="text"],
input[type="number"],
textarea {
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #1c1c29;
  background: #ffffff;
  color: #1c1c29;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus {
  outline: none;
  border-color: #4247c1;
  box-shadow: 0 0 0 2px rgba(66, 71, 193, 0.1);
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

textarea {
  resize: vertical;
  font-family: inherit;
}

.select-wrapper {
  position: relative;
}

select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #1c1c29;
  background: #ffffff;
  color: #1c1c29;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231c1c29' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

select:focus {
  outline: none;
  border-color: #4247c1;
  box-shadow: 0 0 0 2px rgba(66, 71, 193, 0.1);
}

.new-input {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #4247c1;
  background: #ffffff;
  color: #1c1c29;
  font-size: 1rem;
  transition: all 0.2s;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid #1c1c29;
  border-radius: 6px;
  background: #ffffff;
  color: #1c1c29;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.file-label:hover {
  border-color: #4247c1;
  background: #f0f0f5;
  color: #4247c1;
}

.file-icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.file-name {
  color: #4247c1;
  font-weight: 500;
}

.image-preview {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: space-between;
  align-items: center;
}

.form-actions-left {
  display: flex;
  gap: 1rem;
}

.form-actions-right {
  display: flex;
  gap: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #4247c1;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #3539a0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 71, 193, 0.3);
}

.btn-primary:disabled {
  background: #cccccc;
  color: #666666;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f0f0f5;
  color: #1c1c29;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #e0e0e0;
  border-color: #1c1c29;
}

.btn-danger {
  background: #ff6b6b;
  color: #ffffff;
}

.btn-danger:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
}

.btn-danger:disabled {
  background: #cccccc;
  color: #666666;
  cursor: not-allowed;
  transform: none;
}

.error {
  color: #ff6b6b;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 6px;
  border-left: 4px solid #ff6b6b;
}

.success {
  color: #30a84a;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(48, 168, 74, 0.1);
  border-radius: 6px;
  border-left: 4px solid #30a84a;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: #fff;
  color: #1c1c29;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 16px;
  width: 320px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal h4 {
  margin: 0 0 8px;
  color: #4247c1;
}

.modal p {
  margin: 0 0 12px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.modal .btn {
  background: #f0f0f5;
  color: #1c1c29;
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.modal .btn:hover {
  background: #e8e8f2;
}

.modal .btn.danger {
  background: #ff6b6b;
  color: #fff;
  border-color: #ff6b6b;
}

.modal .btn.danger:hover {
  background: #ff5252;
}

.modal .btn:disabled {
  background: #cccccc;
  color: #666;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions-left,
  .form-actions-right {
    width: 100%;
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    width: 100%;
  }
}
</style>
