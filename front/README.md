# GeekLab - Frontend

Frontend de la aplicación GeekLab desarrollado con Vue.js 3.

## Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## Estructura del Proyecto

```
front/
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── assets/
│   │   ├── geeklab-logo.png
│   │   └── products.css
│   ├── components/
│   │   ├── AlertModal.vue
│   │   ├── CartModal.vue
│   │   ├── ChangePasswordModal.vue
│   │   ├── Navbar.vue
│   │   ├── ProductCard.vue
│   │   ├── Toast.vue
│   │   └── VantaBackground.vue
│   ├── composables/
│   │   └── useToast.js
│   ├── stores/
│   │   ├── cartStore.js
│   │   └── userStore.js
│   ├── views/
│   │   ├── CreateProduct.vue
│   │   ├── ForumView.vue
│   │   ├── LoginView.vue
│   │   ├── NotFoundView.vue
│   │   ├── ProductDetailView.vue
│   │   ├── ProductsView.vue
│   │   ├── RegisterView.vue
│   │   └── UserProfileView.vue
│   ├── App.vue
│   ├── main.js
│   ├── router.js
│   └── style.css
├── public/
├── index.html
├── vite.config.js
└── package.json
```

## Tecnologías

- **Vue.js 3.5** - Framework JavaScript reactivo con Composition API
- **Vue Router 4** - Sistema de enrutamiento con guards de navegación
- **Pinia 3** - Gestión de estado global (reemplazo moderno de Vuex)
- **Axios 1.13** - Cliente HTTP para comunicación con la API REST
- **Socket.io Client 4.8** - Comunicación en tiempo real (WebSocket + polling)
- **Vite 7** - Build tool ultrarrápido y servidor de desarrollo con HMR
- **Vanta.js** - Efectos de fondo 3D interactivos (birds, waves, etc.)

## Características Principales

### Autenticación

- Login y registro de usuarios
- Protección de rutas mediante guards
- Tokens JWT almacenados en localStorage
- Interceptores Axios para añadir tokens automáticamente

### Gestión de Estado (Pinia)

#### `userStore`

- Estado del usuario autenticado
- Token JWT
- Funciones: login, register, logout
- Inicialización desde localStorage

#### `cartStore`

- Items del carrito (sin almacenar stock para evitar datos desactualizados)
- Persistencia en localStorage con keys por usuario (`cart:userId` / `cart:guest`)
- Separación automática entre usuarios y modo invitado
- Funciones principales:
  - `addToCart(product)` - Valida stock actual contra catálogo
  - `removeFromCart(productId)` - Elimina item del carrito
  - `updateQuantity(productId, quantity)` - Actualiza cantidad libremente
  - `checkout()` - Envía compra al backend, valida stock real
- Validación de stock solo al agregar (stock real se valida en backend)
- Items del carrito no incluyen propiedad `stock` para prevenir desincronización

### Rutas

- `/` - Redirige a `/products`
- `/login` - Página de inicio de sesión
- `/register` - Página de registro
- `/products` - Listado de productos (requiere auth)
- `/products/create` - Crear producto (requiere admin)
- `/products/:id` - Detalle de producto (requiere auth)
- `/products/:id/edit` - Editar producto (requiere admin)
- `/forum` - Foro de discusión (requiere auth)
- `/account` - Perfil de usuario (requiere auth)
- `/:pathMatch(.*)*` - Página 404 para rutas no encontradas

### Componentes Principales

#### `ProductCard.vue`

- Muestra información básica del producto
- Sistema de estrellas para calificación
- Botones de admin para gestionar stock (cuando está fuera de stock)
- Modales para agregar stock y eliminar producto

#### `CartModal.vue`

- Modal del carrito de compras
- Lista de productos con imágenes
- Control de cantidad (botones +/- e input directo)
- Validación de stock en tiempo real
- Total calculado automáticamente

#### `Navbar.vue`

- Navegación principal
- Menú según rol de usuario
- Icono de carrito con badge de cantidad
- Integración con CartModal

#### `ProductDetailView.vue`

- Vista detallada del producto
- Sistema de reseñas con estrellas interactivas
- Formulario para dejar reseñas
- Gestión de stock para admins (cuando está fuera de stock)
- Botón de edición para admins

#### `CreateProduct.vue`

- Formulario para crear/editar productos
- Subida de imágenes
- Validación de formulario
- Modo edición detectado automáticamente por ruta
- Modal de confirmación para eliminar productos

### Funcionalidades de Admin

- **Crear productos:** Formulario completo con validación
- **Editar productos:** Mismo formulario, carga datos existentes
- **Eliminar productos:** Desde vista de edición o cards
- **Gestionar stock:** Añadir stock cuando producto está fuera de stock
- **Modales de confirmación:** Para acciones destructivas

### Validaciones Implementadas

- **Stock:** No se puede agregar más productos de los disponibles
- **Reseñas:** Calificación y comentario obligatorios
- **Formularios:** Validación en tiempo real
- **Autenticación:** Rutas protegidas según rol

### Comunicación en Tiempo Real

- **Foro:** Actualización en tiempo real de mensajes mediante Socket.io
- **Stock:** Actualización de stock en tiempo real (si se implementa)

## Estilos

- **CSS Scoped:** Cada componente tiene sus propios estilos
- **CSS Global:** `products.css` para estilos compartidos de productos
- **Responsive:** Diseño adaptable a diferentes tamaños de pantalla
- **Temas:** Colores principales definidos en variables CSS

## Configuración de API

### Axios (`src/api/axios.js`)

El cliente HTTP está configurado con:

- **Base URL:** Se detecta automáticamente según el entorno
  - Desarrollo: `http://localhost:4000/api`
  - Producción: `https://geeklab-back.sgomez.dev/api`
- **Interceptor de Request:** Añade token JWT automáticamente en header `Authorization`
- **Headers:** `Authorization: Bearer <token>` en peticiones autenticadas

### Socket.io (`src/api/socket.js`)

Configuración de WebSocket para tiempo real:

- **URL:** `https://geeklab-back.sgomez.dev` (producción)
- **Transports:** `['websocket', 'polling']` - WebSocket preferido, polling como fallback
- **Reconnection:** Habilitado con 5 intentos y delay de 1 segundo
- **Timeout:** 20 segundos
- **Factory:** `createSocket()` crea nuevas instancias por componente

### URLs de Imágenes (`src/api/urls.js`)

Helper para construir URLs de imágenes correctamente:

- Detecta hostname automáticamente
- Construye URLs absolutas para imágenes de productos
- Normaliza rutas para evitar dobles barras
- Función: `buildImageUrl(image)` exportada para uso en componentes

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo

## Pruebas

### Pruebas Manuales Recomendadas

1. **Navegación:**

   - Verifica todas las rutas
   - Prueba la página 404
   - Verifica redirecciones

2. **Autenticación:**

   - Registro de nuevo usuario
   - Login con credenciales válidas
   - Logout y verificación de limpieza de estado

3. **Productos:**

   - Listado de productos
   - Vista de detalle
   - Sistema de estrellas en cards y detalle

4. **Carrito:**

   - Agregar productos
   - Modificar cantidad (botones e input)
   - Validación de stock
   - Eliminar productos

5. **Reseñas:**

   - Ver reseñas existentes
   - Crear nueva reseña con estrellas
   - Validación de campos

6. **Admin:**

   - Crear producto
   - Editar producto
   - Eliminar producto
   - Gestionar stock desde cards

7. **Foro:**

   - Ver mensajes históricos
   - Enviar mensaje
   - Verificación de tiempo real con múltiples navegadores
   - Deduplicación automática de mensajes

8. **Actualizaciones en Tiempo Real:**
   - Abrir catálogo en múltiples navegadores
   - Hacer checkout desde uno
   - Verificar actualización automática del stock en el otro

## Despliegue

### Despliegue con Docker

El proyecto incluye `Dockerfile` y `nginx.conf`:

```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Despliegue en Producción

Actualmente desplegado en:

- **URL:** [https://geeklab.sgomez.dev](https://geeklab.sgomez.dev)
- **Servidor:** Nginx en clúster Kubernetes
- **CI/CD:** Jenkins con pipeline automatizado
- **SSL:** Let's Encrypt con renovación automática
- **CDN:** Potencial para assets estáticos (futuro)

## Notas de Desarrollo

- El proyecto usa **ES Modules** y Vite
- **Composition API** de Vue 3 en todos los componentes
- **Script Setup** (`<script setup>`) para sintaxis más limpia
- **Reactive refs** (`ref()`) para estado local reactivo
- **Computed properties** (`computed()`) para valores derivados
- **Watch** para reactividad a cambios de estado
- **Teleport** para modales renderizados en body
- **Socket.io** con manejo de lifecycle en `onMounted`/`onBeforeUnmount`
- **Deduplicación** de mensajes del foro por `_id` para evitar duplicados
- **Watchers** para efectos secundarios

## Seguridad

- Tokens JWT almacenados en localStorage
- Validación de roles en el frontend (verificación adicional en backend)
- Sanitización de inputs en formularios
- Validación de stock en múltiples capas

## Despliegue e Infraestructura

- **Orquestación CI/CD:** Jenkins ejecuta pipelines que lint-ean, prueban, construyen imágenes Docker y publican actualizaciones en el clúster.
- **Entorno de ejecución:** Se despliega como un servicio sin estado en el mismo clúster de Kubernetes que aloja el backend.
- **Conectividad con el backend:** Se comunica con el backend en Express que corre en Kubernetes, el cual a su vez consume una instancia de MongoDB alojada en un servidor externo.
- **Exposición pública:** El build de producción se sirve en internet mediante Nginx, exponiendo los artefactos compilados de `dist/` en [https://geeklab.sgomez.dev](https://geeklab.sgomez.dev).

---

Para más información sobre el proyecto completo, consulta el [README principal](../README.md).
