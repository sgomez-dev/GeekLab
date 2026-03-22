# GeekLab - E-commerce de Productos de Informática

Aplicación web full-stack para la venta de productos de informática, con backend Node.js/Express y frontend en Svelte 5 (Vite, runes) consumiendo endpoints REST protegidos con JWT/roles.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Pruebas](#pruebas)
- [Decisiones de Desarrollo](#decisiones-de-desarrollo)
- [Características Principales](#características-principales)

## Descripción

GeekLab es una plataforma de e-commerce especializada en productos de informática que permite a los usuarios:

- Explorar y buscar productos tecnológicos con filtros avanzados
- Gestionar un carrito de compras persistente por usuario
- Realizar compras seguras con validación de stock en tiempo real
- Dejar reseñas con sistema de estrellas (1-5) y comentarios
- Participar en un foro de discusión en tiempo real con WebSockets
- Consultar datos mediante GraphQL para consultas flexibles y eficientes
- Administrar productos: crear, editar, eliminar y gestionar stock (solo administradores)
- Gestionar usuarios: crear, editar roles y eliminar usuarios (solo administradores)
- Sistema de autenticación con JWT y roles de usuario
- Actualización en tiempo real del stock del catálogo tras compras

## Tecnologías Utilizadas

### Frontend

- **Svelte 5 + Runes** - Estado con `$state`, cálculos con `$derived` y efectos con `$effect`
- **svelte-spa-router** - Navegación SPA y protección de rutas con `wrap()` + `conditions`
- **Axios** - Cliente HTTP para peticiones API con JWT (`Authorization: Bearer <token>`)
- **Socket.io Client 4.8** - Comunicación en tiempo real (foro)
- **Vite (8)** - Tooling de build/desarrollo
- **Vanta.js** - Efectos visuales 3D (si están presentes en tu UI)

### Backend

- **Node.js 20+** - Entorno de ejecución JavaScript
- **Express.js 5** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose 8** - ODM para MongoDB
- **Apollo Server 5** - Servidor GraphQL para consultas avanzadas
- **Socket.io 4.8** - Comunicación en tiempo real (WebSocket + polling)
- **JWT** - Autenticación mediante tokens
- **Multer** - Manejo de carga de archivos
- **bcryptjs** - Encriptación de contraseñas
- **http-status-codes** - Códigos de estado HTTP estandarizados
- **Redis Adapter** (opcional) - Para escalado horizontal con múltiples pods

## Estructura del Proyecto

```
GeekLab/
├── back/
│   ├── src/
│   │   ├── config/
│   │   ├── graphql/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── server.js
│   │   └── socket.js
│   ├── uploads/
│   └── package.json
│
├── front/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── state/
│   │   ├── App.svelte
│   │   ├── main.js
│   └── package.json
│
└── README.md
```

## Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **MongoDB** (local o remoto - MongoDB Atlas)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/sgomez-dev/GeekLab.git
cd GeekLab
```

### 2. Instalar dependencias del Backend

```bash
cd back
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../front
npm install
```

## Configuración

### Backend

1. Crear un archivo `.env` en la carpeta `back/`:

```env
# Base de datos MongoDB
MONGO_URI=mongodb://localhost:27017/GeekLab

# Puerto del servidor
PORT=4000

# Secreto para firmar tokens JWT (usar cadena aleatoria segura en producción)
JWT_SECRET=secreto_jwt_seguro_cambiar_en_produccion
```

2. Variables de entorno importantes:
   - `MONGO_URI`: Conexión a MongoDB (local)
   - `JWT_SECRET`: Clave secreta para firmar tokens (¡cambiar en producción!)
   - `PORT`: Puerto donde correrá el servidor (default: 4000)

### Frontend

El frontend detecta automáticamente el entorno y configura la URL del backend:

- **Producción**: `https://geeklab-back.sgomez.dev/api`
- **Desarrollo local**: `http://localhost:4000/api`

Si necesitas cambiar la configuración, modifica:

- `front/src/services/api.ts` - Cliente HTTP (Axios) y gestión de token JWT en memoria
- `front/src/pages/ForumPage.svelte` - Conexiones Socket.io para el foro
- `front/src/api/urls.js` - Para construcción de URLs de imágenes

## Ejecución

### Desarrollo

#### Terminal 1 - Backend

```bash
cd back
npm start
```

El servidor estará disponible en `http://localhost:4000`

#### Terminal 2 - Frontend

```bash
cd front
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne)

O sirve la carpeta `dist/` con tu servidor web preferido (nginx, Apache, etc.)

## Pruebas

### Pruebas Manuales

#### 1. Autenticación

- **Registro:** Navega a `/register` y crea una cuenta
- **Login:** Inicia sesión con las credenciales creadas
- **Logout:** Verifica que el botón de cerrar sesión funcione

#### 2. Productos

- **Listado:** Verifica que se muestren todos los productos en `/products`
- **Detalle:** Haz clic en un producto para ver sus detalles
- **Búsqueda:** Prueba buscar productos
- **Filtros:** Verifica filtros por categoría/marca (si existen)

#### 3. Carrito de Compras

- **Agregar:** Agrega productos al carrito desde la lista o detalle
- **Modificar cantidad:** Usa los botones +/- o escribe directamente la cantidad
- **Validación de stock:** Intenta agregar más productos de los disponibles
- **Eliminar:** Elimina productos del carrito

#### 4. Reseñas

- **Ver reseñas:** Revisa las reseñas existentes en la página de detalle
- **Crear reseña:** Deja una reseña con estrellas y comentario
- **Validación:** Verifica que se requiera calificación y comentario

#### 5. Funcionalidades de Admin

- **Crear producto:** Navega a `/products/create` (requiere rol admin)
- **Editar producto:** Haz clic en "Editar Producto" en el detalle
- **Eliminar producto:** Elimina un producto desde la vista de edición
- **Gestionar stock:** Añade stock a productos fuera de stock desde las cards
- **Gestionar usuarios:** Navega a `/admin/users` para crear, editar roles o eliminar usuarios
- **Ver órdenes:** Navega a `/admin/orders` para ver todas las órdenes del sistema

#### 6. Foro

- **Ver mensajes:** Navega a `/forum` y revisa los mensajes
- **Enviar mensaje:** Publica un nuevo mensaje en el foro
- **Tiempo real:** Abre dos navegadores y verifica que los mensajes aparezcan en tiempo real

#### 7. Página 404

- **Ruta inválida:** Navega a una ruta que no existe (ej: `/ruta-inexistente`)
- **Botón de retorno:** Verifica que el botón "Volver al catálogo" funcione

#### 8. GraphQL

- **Endpoint:** Accede a `http://localhost:4000/graphql` en tu navegador
- **Queries:** Prueba consultas como `{ products { _id name price stock } }`
- **Mutations:** Crea, actualiza o elimina productos mediante GraphQL
- **Autenticación:** Incluye el header `Authorization: Bearer <token>`
- **Herramientas:** Usa Postman, Insomnia o GraphQL Playground para probar

### Pruebas de Integración

1. **Flujo completo de compra:**

   - Registro/Login → Ver productos → Agregar al carrito → Checkout → Ver orden

2. **Gestión de stock:**

   - Admin añade stock → Usuario agrega al carrito → Verifica que el stock se actualice

3. **Sistema de reseñas:**
   - Usuario deja reseña → Verifica que aparezca en el detalle → Verifica que actualice el promedio

## Decisiones de Desarrollo

### Arquitectura

**Decisión:** Separación completa frontend/backend (SPA + API REST)

**Razón:**

- Facilita el desarrollo independiente de cada parte
- Permite escalar frontend y backend por separado
- Facilita el mantenimiento y testing
- Permite reutilizar el backend para otras aplicaciones (móvil, etc.)

### Gestión de Estado

**Decisión:** Estado global en `front/src/App.svelte` usando **runes de Svelte 5** (`$state`, `$derived`, `$effect`) y stores de Svelte para estados compartidos (carrito/toast/etc.)

**Razón:**

- `$state` para token/usuario/productos y banderas de UI
- `$derived` para cálculos como `isAdmin` y listas filtradas
- `$effect` para sincronizar el token con el cliente HTTP y manejar redirecciones
- Stores en `front/src/state/*` para datos compartidos entre múltiples componentes

### Runes de Svelte 5 usadas (según componente)

- `front/src/App.svelte`: `$state`, `$derived`, `$effect`
- `front/src/components/Navbar.svelte`: `$state`, `$effect`
- `front/src/pages/LoginPage.svelte`: (sin runes, estado local con variables normales)
- `front/src/pages/RegisterPage.svelte`: (sin runes, estado local con variables normales)
- `front/src/pages/ProductsPage.svelte`: `$state`, `$derived`
- `front/src/pages/ProductDetailPage.svelte`: `$state`, `$derived`, `$effect`
- `front/src/pages/ProductFormPage.svelte`: `$state`, `$derived`, `$effect`
- `front/src/pages/AdminUsersPage.svelte`: `$state`, `$derived`, `$effect`
- `front/src/pages/AdminOrdersPage.svelte`: `$state` y `onMount`
- `front/src/pages/UserProfilePage.svelte`: `$state`
- `front/src/components/ProductCard.svelte`: `$props`
- `front/src/components/CartModal.svelte`: `$props`, `$state`
- `front/src/components/ConfirmModal.svelte`: `$props`

### Endpoints REST consumidos (roles)

- Público:
  - `POST /api/auth/login` (login)
  - `POST /api/auth/register` (registro)
- Usuario autenticado (`role: user` o `role: admin`):
  - `GET /api/products` (listado)
  - `GET /api/products/:id` (detalle)
  - `POST /api/products/:id/reviews` (reseñas)
  - `PUT /api/auth/password` (cambio de contraseña)
  - `POST /api/checkout` (checkout)
  - `GET /api/forum/messages` (foros)
  - `POST /api/forum/messages` (enviar mensaje)
- Admin (`role: admin`):
  - `POST /api/products` (crear)
  - `PUT /api/products/:id` (editar)
  - `DELETE /api/products/:id` (borrar)
  - `GET /api/users` (listar)
  - `POST /api/users` (crear usuario)
  - `PUT /api/users/:id/role` (cambiar rol)
  - `DELETE /api/users/:id` (dar de baja)
  - `GET /api/orders` (listar pedidos)
  - `PUT /api/orders/:id/status` (cambiar estado)

### Autenticación

**Decisión:** JWT (JSON Web Tokens) almacenados en localStorage

**Razón:**

- Stateless: no requiere sesiones en el servidor
- Escalable: funciona bien con múltiples servidores
- Seguro: tokens firmados criptográficamente
- Fácil de implementar en SPA

### Base de Datos

**Decisión:** MongoDB con Mongoose

**Razón:**

- Flexibilidad en el esquema (útil para productos con especificaciones variables)
- Fácil integración con Node.js
- Buen rendimiento para lecturas frecuentes
- Soporte nativo para JSON

### Comunicación en Tiempo Real

**Decisión:** Socket.io para el foro

**Razón:**

- Permite actualizaciones en tiempo real sin polling
- Fácil de implementar
- Soporte automático para fallback a polling si WebSockets no están disponibles
- Ideal para chat/foro

### Manejo de Archivos

**Decisión:** Multer para subida de imágenes de productos

**Razón:**

- Middleware estándar para Express
- Fácil configuración
- Soporte para validación de tipos de archivo
- Almacenamiento local simple (puede migrarse a S3/Cloudinary en producción)

### Validación de Stock

**Decisión:** Validación en múltiples capas (frontend y backend)

**Razón:**

- Frontend: Mejor UX, feedback inmediato
- Backend: Seguridad, previene manipulación
- Validación en checkout: Última línea de defensa

### Sistema de Reseñas

**Decisión:** Sistema de estrellas (1-5) con comentarios obligatorios

**Razón:**

- Visual e intuitivo para usuarios
- Permite calcular promedio fácilmente
- Comentarios obligatorios para obtener feedback útil
- Un usuario puede actualizar su reseña (no múltiples)

### Rutas y Navegación

**Decisión:** SPA con `svelte-spa-router` usando precondiciones por ruta (`wrap()` + `conditions`)

**Razón:**

- Declarativo y fácil de mantener
- Protección por `auth/role` evitando render de pantallas privadas
- Soporte para rutas dinámicas (`/products/:id`) y catch-all (`*`) para 404

### Componentes Reutilizables

**Decisión:** Componentes Svelte modulares y reutilizables

**Razón:**

- DRY (Don't Repeat Yourself)
- Fácil mantenimiento
- Consistencia en la UI
- Ejemplos: `ProductCard.svelte`, `CartModal.svelte`, `ToastContainer.svelte`

### Estilos

**Decisión:** CSS scoped en componentes + CSS global para estilos compartidos

**Razón:**

- Scoped: Evita conflictos de estilos
- Global: Para estilos compartidos (products.css)
- Sin frameworks CSS pesados: Más control y menor bundle size

### Gestión de Carrito

**Decisión:** Carrito persistente en localStorage con separación por usuario y sin almacenamiento de stock

**Razón:**

- Persiste entre sesiones del navegador
- Rápido (no requiere peticiones al servidor para agregar/remover)
- Separación por usuario usando keys dinámicas (`cart:userId` / `cart:guest`)
- Se guarda stock solo para UX (limitar stepper y evitar cantidades imposibles)
- La validación final de stock ocurre siempre en el backend durante el checkout (`POST /api/checkout`)
- Aun con validación local, el backend es la última fuente de verdad

### Página 404

**Decisión:** Ruta catch-all con componente dedicado

**Razón:**

- Mejor UX que error del navegador
- Consistente con el diseño de la aplicación
- Permite guiar al usuario de vuelta

### Orden de Rutas en Express

**Decisión:** Rutas específicas antes de rutas dinámicas

**Razón:**

- Express evalúa rutas en orden
- `/products/:id/reviews` debe ir antes de `/products/:id`
- Evita conflictos y errores 404 incorrectos

## Frontend Svelte 5: runes y endpoints consumidos (según el PDF)

### Runes usadas (y dónde)

- `front/src/App.svelte`
  - `$state`: `token`, `user`, `products` y banderas de UI
  - `$derived`: `role/isAdmin` y `filteredProducts`
  - `$effect`: sincroniza el token con el cliente HTTP y redirige cuando aplica
- `front/src/pages/ProductsPage.svelte`
  - `$state`: búsqueda/filtros/local UI
  - `$derived`: marcas/categorías disponibles y lista filtrada
  - callbacks: eliminar productos (admin)
- `front/src/pages/ProductDetailPage.svelte`
  - `$state`: formulario de reseñas y estado de UI (añadir al carrito, confirm delete)
  - `$derived`: validación `canSubmitReview`
- `front/src/pages/ProductFormPage.svelte`
  - `$state`: campos del formulario y carga/errores
  - `$derived`: modo `create/edit` según `params`
  - `$effect`: carga del producto cuando se edita
- `front/src/pages/AdminUsersPage.svelte`
  - `$state`: modales, carga y formularios
  - `$derived`: `currentUserId` para deshabilitar acciones destructivas sobre tu cuenta
- `front/src/pages/ForumPage.svelte`
  - `$state`: mensajes, contenido y estado del socket

### Endpoints REST usados y roles

La API base está montada en `/api` (token JWT en header `Authorization: Bearer <token>`).

- Auth
  - `POST /api/auth/login`: `user` y `admin`
  - `POST /api/auth/register` (si se usa): `user`
  - Cambio de contraseña (si se usa en la UI): requiere `authenticateJWT`
- Productos (catálogo)
  - `GET /api/products`: `user` y `admin`
  - `GET /api/products/:id`: `user` y `admin`
- Productos (admin)
  - `POST /api/products`: `admin`
  - `PUT /api/products/:id`: `admin`
  - `DELETE /api/products/:id`: `admin`
- Reseñas (user/admin)
  - `POST /api/products/:id/reviews`: requiere `user` autenticado (el backend protege con JWT)
- Usuarios (admin)
  - `GET /api/users`: `admin`
  - `POST /api/users`: `admin`
  - `PUT /api/users/:id/role`: `admin`
  - `DELETE /api/users/:id`: `admin`
- Checkout (user/admin)
  - `POST /api/checkout`: requiere `user` autenticado
  - Validación final de stock en el backend
- Foro (user/admin)
  - `GET /api/forum/messages`: `user` y `admin`
  - `POST /api/forum/messages`: requiere `user` autenticado
  - Socket: evento `forum:new` (broadcast del backend a todos los clientes)

### Rutas protegidas en el frontend

- `user`: `/products`, `/products/:id`, `/account`, `/forum`
- `admin`: `/products/create`, `/products/:id/edit`, `/admin/users`, `/admin/orders`

## Características Principales

### Usuarios

- Registro e inicio de sesión
- Perfil de usuario con cambio de contraseña
- Carrito de compras persistente
- Sistema de reseñas con estrellas
- Foro en tiempo real

### Administradores

- Crear, editar y eliminar productos
- Subida de imágenes de productos
- Gestión de stock (añadir cuando está fuera de stock)
- Eliminar productos desde cards o vista de edición
- Crear y gestionar usuarios (cambiar roles, eliminar)
- Ver y gestionar todas las órdenes del sistema
- Acceso a GraphQL para consultas avanzadas
- Crear y gestionar usuarios (cambiar roles, eliminar)
- Ver y gestionar todas las órdenes del sistema
- Acceso a GraphQL para consultas avanzadas

### Productos

- Listado con cards visuales
- Vista detallada con especificaciones
- Sistema de calificación con estrellas
- Filtrado por categoría y marca
- Validación de stock en tiempo real

### Carrito

- Agregar/eliminar productos
- Modificar cantidad (botones +/- o input directo)
- Validación de stock disponible
- Cálculo automático del total
- Checkout con validación final

### Interfaz

- Diseño responsive
- Modales para confirmaciones
- Toasts para notificaciones
- Página 404 personalizada
- Navegación intuitiva

### GraphQL

- **Endpoint:** `/graphql` disponible para consultas avanzadas
- **Queries disponibles:**
  - `products` - Obtener productos con filtros opcionales
  - `product(id)` - Obtener un producto específico
  - `users` - Listar usuarios (requiere admin)
  - `orders` - Obtener órdenes del usuario autenticado
- **Mutations disponibles:**
  - `createProduct` - Crear nuevo producto (requiere admin)
  - `updateProduct` - Actualizar producto existente (requiere admin)
  - `deleteProduct` - Eliminar producto (requiere admin)
- **Documentación completa:** Ver [GRAPHQL_DOCUMENTATION.md](GRAPHQL_DOCUMENTATION.md)
- **Introspección:** Habilitada para exploración con herramientas como GraphQL Playground

## Notas Adicionales

- El proyecto usa ES Modules (`type: "module"` en package.json)
- Las imágenes se almacenan localmente en `back/uploads/`
- MongoDB debe estar corriendo antes de iniciar el backend

## Seguridad

- Contraseñas hasheadas con bcryptjs
- Autenticación JWT
- Validación de roles (admin/user)
- Sanitización de inputs
- Validación de stock en múltiples capas

## Despliegue e Infraestructura

### Servidor de Producción

La aplicación está desplegada en un servidor propio usando:

- **Orquestación:** Kubernetes (MicroK8s) para gestión de contenedores
- **CI/CD:** Jenkins ejecuta pipelines automatizados que:

  - Analizan el código con SonarQube para calidad y seguridad
  - Construyen imágenes Docker optimizadas para producción
  - Publican nuevas versiones en el clúster de Kubernetes
  - Ejecutan despliegues sin tiempo de inactividad (rolling updates)

- **Contenedores Docker:**

  - Backend: Node.js con Express y Socket.io
  - Frontend: Build estático de Svelte servido con Nginx
  - Ambos servicios corriendo como pods en Kubernetes

- **Base de Datos:**

  - MongoDB alojado en servidor externo
  - Conexión segura mediante credenciales en variables de entorno

- **Networking:**

  - Frontend accesible en: [https://geeklab.sgomez.dev](https://geeklab.sgomez.dev)
  - Backend API en: [https://geeklab-back.sgomez.dev](https://geeklab-back.sgomez.dev)
  - CORS configurado para permitir comunicación entre dominios

- **WebSockets:**

  - Socket.io configurado con soporte para múltiples transportes (WebSocket + polling)
  - CORS habilitado para orígenes permitidos

- **Archivos Estáticos:**
  - Imágenes de productos almacenadas en `/uploads` del backend
  - Servidas con headers CORS para prevenir bloqueos ERR_BLOCKED_BY_ORB
  - Headers de caché configurados para optimizar rendimiento

### Escalabilidad

El sistema está diseñado para escalar horizontalmente:

- Kubernetes permite aumentar réplicas de pods según demanda
- Redis Adapter opcional para Socket.io en configuración multi-pod
- MongoDB puede migrarse a replica set para alta disponibilidad
- CDN puede agregarse para servir assets estáticos

### Monitoreo y Logs

- Logs centralizados de aplicación disponibles en Kubernetes
- SonarQube para análisis continuo de calidad de código
- Métricas de rendimiento y uso de recursos en el clúster

---

**Desarrollado con ❤️ para GeekLab by sgomez-dev**
