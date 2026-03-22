# GeekLab - Frontend (Svelte 5)

Frontend SPA construido con **Svelte 5 (Vite)** que consume la API REST del backend (`/api`), gestiona autenticación con JWT y mantiene estado global (token/usuario/productos, carrito, toasts) en el cliente.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
cd front
npm install
```

## Desarrollo

```bash
npm run dev
```

Por defecto el dev server corre en `http://localhost:32136` (según `vite.config.js`).

## Build

```bash
npm run build
```

## Rutas (SPA)

- `/login` Login
- `/register` Registro (crea usuario y redirige a login)
- `/products` Catálogo (requiere auth)
- `/products/:id` Detalle de producto (requiere auth)
- `/products/create` y `/products/:id/edit` Gestión de productos (solo admin)
- `/admin/users` Gestión de usuarios (solo admin)
- `/admin/orders` Gestión de pedidos (solo admin)
- `/forum` Foro en tiempo real (requiere auth)
- `/account` Perfil y cambio de contraseña (requiere auth)
- `*` 404

## Tecnologías

- `svelte` + **runes** de Svelte 5 (`$state`, `$derived`, `$effect`, `$props`)
- `svelte-spa-router` para routing SPA
- `axios` para el consumo de la API
- `socket.io-client` para el foro en tiempo real

## Runes y componentes (Svelte 5)

- `front/src/App.svelte`: `$state`, `$derived`, `$effect`
- `front/src/components/Navbar.svelte`: `$state`, `$effect`
- `front/src/pages/ProductsPage.svelte`: `$state`, `$derived`
- `front/src/pages/ProductDetailPage.svelte`: `$state`, `$derived`, `$effect`
- `front/src/pages/ProductFormPage.svelte`: `$state`, `$derived`, `$effect`
- `front/src/pages/AdminUsersPage.svelte`: `$state`, `$derived`, `$effect`
- `front/src/pages/AdminOrdersPage.svelte`: `$state` y `onMount`
- `front/src/pages/UserProfilePage.svelte`: `$state`
- `front/src/components/ProductCard.svelte`: `$props`
- `front/src/components/CartModal.svelte`: `$props`, `$state`
- `front/src/components/ConfirmModal.svelte`: `$props`

## Endpoints REST usados (roles)

- Público:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
- Usuario autenticado:
  - `GET /api/products`
  - `GET /api/products/:id`
  - `POST /api/products/:id/reviews`
  - `PUT /api/auth/password`
  - `POST /api/checkout`
  - `GET /api/forum/messages`
  - `POST /api/forum/messages`
- Admin:
  - `POST /api/products`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
  - `GET /api/users`
  - `POST /api/users`
  - `PUT /api/users/:id/role`
  - `DELETE /api/users/:id`
  - `GET /api/orders`
  - `PUT /api/orders/:id/status`

