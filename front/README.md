# GeekLab - Frontend

Frontend de la aplicación GeekLab desarrollado con Vue.js 3.

##  Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

##  Estructura del Proyecto

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

##  Tecnologías

- **Vue.js 3** - Framework JavaScript reactivo con Composition API
- **Vue Router 4** - Sistema de enrutamiento
- **Pinia** - Gestión de estado global
- **Axios** - Cliente HTTP para comunicación con la API
- **Socket.io Client** - Comunicación en tiempo real para el foro
- **Vite** - Build tool y servidor de desarrollo

##  Características Principales

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
- Items del carrito
- Persistencia en localStorage
- Separación por usuario (guest/user)
- Funciones: addToCart, removeFromCart, updateQuantity, checkout
- Validación de stock antes de agregar productos

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

##  Estilos

- **CSS Scoped:** Cada componente tiene sus propios estilos
- **CSS Global:** `products.css` para estilos compartidos de productos
- **Responsive:** Diseño adaptable a diferentes tamaños de pantalla
- **Temas:** Colores principales definidos en variables CSS

##  Configuración de API

El cliente Axios está configurado en `src/api/axios.js`:

- Base URL: `http://localhost:4000/api`
- Interceptor para añadir token JWT automáticamente
- Headers de autorización en todas las peticiones autenticadas

Para cambiar la URL del backend, modifica `baseURL` en `axios.js`.

##  Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo

##  Pruebas

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
   - Ver mensajes
   - Enviar mensaje
   - Verificación de tiempo real

##  Notas de Desarrollo

- El proyecto usa **ES Modules**
- **Composition API** de Vue 3 en todos los componentes
- **Script Setup** para sintaxis más limpia
- **Reactive refs** para estado local
- **Computed properties** para valores derivados
- **Watchers** para efectos secundarios

##  Seguridad

- Tokens JWT almacenados en localStorage
- Validación de roles en el frontend (verificación adicional en backend)
- Sanitización de inputs en formularios
- Validación de stock en múltiples capas

---

Para más información sobre el proyecto completo, consulta el [README principal](../README.md).
