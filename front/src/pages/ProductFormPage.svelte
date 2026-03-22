<script>
  import { onMount } from 'svelte';
  import { link, push } from 'svelte-spa-router';
  import { api } from '../services/api';
  import { getContext } from 'svelte';
  import { appActionsKey } from '../state/appContext.js';
  import { isAdminStore, productsStore } from '../state/appStore.js';
  import { buildImageUrl } from '../api/urls.js';
  import { addToast } from '../state/toastStore.js';
  import { get } from 'svelte/store';

  let { params } = $props();
  const actions = getContext(appActionsKey);

  const productId = () => params?.id ?? null;
  const isEditMode = $derived(!!productId());

  let loading = $state(false);
  let error = $state('');
  let success = $state('');

  let name = $state('');
  let brand = $state('');
  let category = $state('');
  let categorySelection = $state('');
  let newCategory = $state('');
  let existingCategories = $state([]);
  let price = $state(0);
  let description = $state('');
  let stock = $state(0);

  let imageFile = $state(null);
  let imagePreview = $state(null);
  let currentImage = $state(null);

  function resetForm() {
    name = '';
    brand = '';
    category = '';
    categorySelection = '';
    newCategory = '';
    price = 0;
    description = '';
    stock = 0;
    imageFile = null;
    imagePreview = null;
    currentImage = null;
  }

  function resolvedCategory() {
    if (categorySelection === '__new__') {
      return newCategory.trim();
    }
    return categorySelection.trim();
  }

  function syncCategoryInput(value) {
    const normalized = String(value ?? '').trim();
    category = normalized;

    if (!normalized) {
      categorySelection = '';
      newCategory = '';
      return;
    }

    if (existingCategories.includes(normalized)) {
      categorySelection = normalized;
      newCategory = '';
      return;
    }

    categorySelection = '__new__';
    newCategory = normalized;
  }

  async function loadExistingCategories() {
    try {
      const res = await api.get('/products');
      const cats = (res.data || [])
        .map((p) => p?.category)
        .filter((c) => c && String(c).trim().length > 0)
        .map((c) => String(c).trim());

      existingCategories = [...new Set(cats)].sort((a, b) => a.localeCompare(b));
      syncCategoryInput(category);
      // Sin productos aún no hay categorías en catálogo: ofrecer crear una sin paso extra.
      if (!productId() && existingCategories.length === 0 && !categorySelection) {
        categorySelection = '__new__';
      }
    } catch {
      existingCategories = [];
      if (!productId()) categorySelection = '__new__';
    }
  }

  function onCategorySelectChange(event) {
    const value = event.currentTarget.value;
    categorySelection = value;

    if (value === '__new__') {
      category = newCategory.trim();
      return;
    }

    newCategory = '';
    category = value.trim();
  }

  function validate() {
    if (!name.trim()) return 'El nombre es requerido';
    if (!brand.trim()) return 'La marca es requerida';
    if (!resolvedCategory()) return 'La categoría es requerida';
    if (!description.trim()) return 'La descripción es requerida';
    if (Number.isNaN(Number(price)) || Number(price) < 0) return 'El precio debe ser 0 o mayor';
    if (Number.isNaN(Number(stock)) || Number(stock) < 0) return 'El stock debe ser 0 o mayor';
    if (!isEditMode && !imageFile) return 'La imagen es requerida';
    return '';
  }

  function onImageChange(event) {
    const file = event.currentTarget.files?.[0] ?? null;
    imageFile = file;
    imagePreview = null;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
    }
  }

  async function loadProduct() {
    const id = productId();
    if (!id) return;
    loading = true;
    error = '';
    success = '';

    try {
      const res = await api.get(`/products/${id}`);
      const p = res.data;
      name = p?.name ?? '';
      brand = p?.brand ?? '';
      syncCategoryInput(p?.category ?? '');
      price = Number(p?.price ?? 0);
      description = p?.description ?? '';
      stock = Number(p?.stock ?? 0);
      currentImage = p?.image ?? null;
    } catch (e) {
      error = e?.response?.data?.message || e?.message || 'Error cargando producto';
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (isEditMode) {
      loadProduct();
    } else {
      resetForm();
    }
  });

  onMount(loadExistingCategories);

  async function onSubmit(event) {
    event.preventDefault();
    error = '';
    success = '';

    const validationError = validate();
    if (validationError) {
      error = validationError;
      return;
    }

    loading = true;
    try {
      const id = productId();
      const finalCategory = resolvedCategory();
      const formData = new FormData();
      formData.append('name', name.trim());
      if (brand.trim()) formData.append('brand', brand.trim());
      if (finalCategory) formData.append('category', finalCategory);
      formData.append('price', String(price));
      formData.append('stock', String(stock));
      if (description.trim()) formData.append('description', description.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = isEditMode
        ? await api.put(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

      const saved = res.data;

      // Actualización optimista para que el producto se vea inmediatamente en catálogo.
      const currentProducts = get(productsStore) || [];
      const savedId = String(saved?._id ?? saved?.id ?? '');
      let nextProducts;

      if (isEditMode) {
        nextProducts = currentProducts.map((p) =>
          String(p?._id ?? p?.id ?? '') === savedId ? { ...p, ...saved } : p
        );
      } else {
        nextProducts = [
          saved,
          ...currentProducts.filter(
            (p) => String(p?._id ?? p?.id ?? '') !== savedId
          ),
        ];
      }

      actions.setProducts(nextProducts);

      try {
        const list = await api.get('/products');
        actions.setProducts(list.data);
      } catch {
        // Si falla el refetch, mantenemos la actualización optimista.
      }

      const categoryToPersist = String(saved?.category ?? finalCategory).trim();
      if (categoryToPersist && !existingCategories.includes(categoryToPersist)) {
        existingCategories = [...existingCategories, categoryToPersist].sort((a, b) => a.localeCompare(b));
      }

      success = isEditMode
        ? 'Producto actualizado correctamente'
        : 'Producto creado correctamente';
      addToast({ type: 'success', message: success, duration: 2500 });
      await push(isEditMode ? `/products/${saved?._id}` : '/products');
    } catch (e) {
      error = e?.response?.data?.message || e?.message || 'Error guardando producto';
      addToast({ type: 'error', message: error, duration: 3500 });
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    const id = productId();
    if (!id) return;
    const ok = window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.');
    if (!ok) return;

    loading = true;
    error = '';
    try {
      await api.delete(`/products/${id}`);
      const list = await api.get('/products');
      actions.setProducts(list.data);
      addToast({ type: 'success', message: 'Producto eliminado', duration: 2500 });
      await push('/products');
    } catch (e) {
      error = e?.response?.data?.message || e?.message || 'Error al eliminar';
      addToast({ type: 'error', message: error, duration: 3500 });
    } finally {
      loading = false;
    }
  }
</script>

<section class="page">
  <div class="toolbar">
    <a class="back" href="/products" use:link>← Volver</a>

    <div class="title">
      <h1>{isEditMode ? 'Editar producto' : 'Crear producto'}</h1>
      <p class="muted">Campos obligatorios y subida de imagen.</p>
    </div>
  </div>

  <div class="card">
    <form on:submit={onSubmit} class="form">
      <div class="grid">
        <div class="field">
          <label>Nombre *</label>
          <input bind:value={name} type="text" placeholder="Ej: Teclado Mecánico RGB" required />
        </div>

        <div class="field">
          <label>Marca *</label>
          <input bind:value={brand} type="text" placeholder="Ej: Logitech" required />
        </div>

        <div class="field">
          <label>Categoría *</label>
          <select bind:value={categorySelection} on:change={onCategorySelectChange} required>
            <option value="" disabled>Selecciona una categoría</option>
            {#each existingCategories as cat}
              <option value={cat}>{cat}</option>
            {/each}
            <option value="__new__">+ Crear nueva categoría</option>
          </select>
          {#if categorySelection === '__new__'}
            <input
              bind:value={newCategory}
              on:input={() => {
                category = newCategory.trim();
              }}
              type="text"
              placeholder="Ej: Teclados"
              required
            />
          {/if}
        </div>

        <div class="field">
          <label>Precio (€) *</label>
          <input bind:value={price} type="number" step="0.01" min="0" required />
        </div>

        <div class="field">
          <label>Stock *</label>
          <input bind:value={stock} type="number" min="0" required />
        </div>

        <div class="field full">
          <label>Descripción *</label>
          <textarea
            bind:value={description}
            rows="5"
            placeholder="Describe las características del producto..."
            required
          ></textarea>
        </div>

        <div class="field full">
          <label>Imagen {isEditMode ? '(opcional)' : '*'}</label>
          <input type="file" accept="image/*" on:change={onImageChange} />

          {#if imagePreview}
            <div class="preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          {:else if currentImage}
            <div class="preview">
              <img
                src={buildImageUrl(currentImage)}
                alt="Imagen actual"
                on:error={(e) => {
                  const img = e.currentTarget;
                  if (img?.dataset?.errored) return;
                  img.dataset.errored = '1';
                  img.src = '/vite.svg';
                }}
              />
            </div>
          {/if}
        </div>
      </div>

      {#if error}
        <div class="error" role="alert">{error}</div>
      {/if}
      {#if success}
        <div class="success">{success}</div>
      {/if}

      <div class="actions">
        {#if isEditMode && $isAdminStore}
          <button class="danger" type="button" on:click={handleDelete} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        {/if}

        <div class="right">
          <button class="secondary" type="button" on:click={() => push('/products')} disabled={loading}>
            Cancelar
          </button>
          <button class="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </form>
  </div>
</section>

<style>
  .page {
    padding: 24px 16px 40px;
  }

  .toolbar {
    max-width: 1200px;
    margin: 0 auto 18px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  .back {
    text-decoration: none;
    font-weight: 900;
    color: var(--primary-color);
    background: rgba(66, 71, 193, 0.07);
    border: 1px solid rgba(66, 71, 193, 0.16);
    padding: 10px 14px;
    border-radius: 12px;
    white-space: nowrap;
  }

  .title h1 {
    margin: 0 0 6px;
    font-size: 2rem;
    color: var(--secondary-color);
  }

  .muted {
    margin: 0;
    color: rgba(28, 28, 41, 0.7);
  }

  .card {
    max-width: 1200px;
    margin: 0 auto;
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  }

  .form {
    width: 100%;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  label {
    font-weight: 900;
    color: rgba(28, 28, 41, 0.75);
    font-size: 0.92rem;
  }

  input,
  select,
  textarea {
    padding: 12px 12px;
    border-radius: 12px;
    border: 1px solid rgba(224, 224, 224, 0.95);
    background: #fff;
    outline: none;
    font-size: 1rem;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(66, 71, 193, 0.12);
  }

  .full {
    grid-column: 1 / -1;
  }

  .preview {
    margin-top: 10px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(224, 224, 224, 0.95);
    max-width: 420px;
  }

  .preview :global(img) {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
  }

  .error {
    margin-top: 14px;
    background: rgba(255, 107, 107, 0.12);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #d32f2f;
    padding: 12px;
    border-radius: 14px;
  }

  .success {
    margin-top: 14px;
    background: rgba(48, 168, 74, 0.12);
    border: 1px solid rgba(48, 168, 74, 0.25);
    color: #2e7d32;
    padding: 12px;
    border-radius: 14px;
  }

  .actions {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .right {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .secondary {
    background: rgba(28, 28, 41, 0.06);
    border: 1px solid rgba(28, 28, 41, 0.14);
    color: var(--secondary-color);
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .primary {
    border: none;
    background: var(--primary-color);
    color: #fff;
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: 1000;
    cursor: pointer;
  }

  .danger {
    border: none;
    background: #ff6b6b;
    color: #fff;
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: 1000;
    cursor: pointer;
  }

  @media (max-width: 920px) {
    .toolbar {
      flex-direction: column;
      align-items: flex-start;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .actions {
      flex-direction: column;
      align-items: stretch;
    }

    .right {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>

