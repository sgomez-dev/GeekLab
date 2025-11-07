# GeekLab - E-commerce de Productos de Informática

Aplicación web full-stack para la venta de productos de informática, desarrollada con Vue.js 3 y Node.js/Express.

##  Tabla de Contenidos

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

##  Descripción

GeekLab es una plataforma de e-commerce especializada en productos de informática que permite a los usuarios:
- Explorar y buscar productos tecnológicos
- Gestionar un carrito de compras
- Realizar compras seguras
- Dejar reseñas con sistema de estrellas
- Participar en un foro de discusión
- Administrar productos (solo administradores)

##  Tecnologías Utilizadas

### Frontend
- **Vue.js 3** - Framework JavaScript reactivo
- **Vue Router** - Enrutamiento de la aplicación
- **Pinia** - Gestión de estado
- **Axios** - Cliente HTTP para peticiones API
- **Socket.io Client** - Comunicación en tiempo real
- **Vite** - Herramienta de construcción y desarrollo

### Backend
- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Socket.io** - Comunicación en tiempo real
- **JWT** - Autenticación mediante tokens
- **Multer** - Manejo de carga de archivos
- **bcryptjs** - Encriptación de contraseñas

##  Estructura del Proyecto

```
GeekLab/
├── back/                  
│   ├── src/
│   │   ├── config/        
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
│   │   ├── composables/   
│   │   ├── stores/      
│   │   ├── views/         
│   │   ├── App.vue        
│   │   ├── main.js       
│   │   └── router.js     
│   └── package.json
│
└── README.md
```

##  Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **MongoDB** (local o remoto - MongoDB Atlas)

##  Instalación

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

##  Configuración

### Backend

1. Crear un archivo `.env` en la carpeta `back/`:

```env
MONGO_URI=mongodb://localhost:27017/GeekLab
PORT=4000
JWT_SECRET=secreto_jwt_aqui
```


### Frontend

El frontend está configurado para conectarse a `http://localhost:4000/api` por defecto. Si necesitas cambiar la URL del backend, modifica `front/src/api/axios.js`.

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

#### 6. Foro
- **Ver mensajes:** Navega a `/forum` y revisa los mensajes
- **Enviar mensaje:** Publica un nuevo mensaje en el foro
- **Tiempo real:** Abre dos navegadores y verifica que los mensajes aparezcan en tiempo real

#### 7. Página 404
- **Ruta inválida:** Navega a una ruta que no existe (ej: `/ruta-inexistente`)
- **Botón de retorno:** Verifica que el botón "Volver al catálogo" funcione

### Pruebas de Integración

1. **Flujo completo de compra:**
   - Registro/Login → Ver productos → Agregar al carrito → Checkout → Ver orden

2. **Gestión de stock:**
   - Admin añade stock → Usuario agrega al carrito → Verifica que el stock se actualice

3. **Sistema de reseñas:**
   - Usuario deja reseña → Verifica que aparezca en el detalle → Verifica que actualice el promedio

##  Decisiones de Desarrollo

### Arquitectura

**Decisión:** Separación completa frontend/backend (SPA + API REST)

**Razón:** 
- Facilita el desarrollo independiente de cada parte
- Permite escalar frontend y backend por separado
- Facilita el mantenimiento y testing
- Permite reutilizar el backend para otras aplicaciones (móvil, etc.)

### Gestión de Estado

**Decisión:** Pinia para gestión de estado global

**Razón:**
- Más simple y ligero que Vuex
- API más intuitiva y moderna
- Mejor integración con Vue 3 Composition API

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

**Decisión:** Vue Router con rutas protegidas mediante meta fields

**Razón:**
- Declarativo y fácil de mantener
- Guards de navegación integrados
- Soporte para rutas dinámicas y parámetros
- Catch-all route para página 404

### Componentes Reutilizables

**Decisión:** Componentes Vue modulares y reutilizables

**Razón:**
- DRY (Don't Repeat Yourself)
- Fácil mantenimiento
- Consistencia en la UI
- Ejemplos: ProductCard, CartModal, Toast

### Estilos

**Decisión:** CSS scoped en componentes + CSS global para estilos compartidos

**Razón:**
- Scoped: Evita conflictos de estilos
- Global: Para estilos compartidos (products.css)
- Sin frameworks CSS pesados: Más control y menor bundle size

### Gestión de Carrito

**Decisión:** Carrito persistente en localStorage con separación por usuario

**Razón:**
- Persiste entre sesiones
- Rápido (no requiere peticiones al servidor)
- Separación por usuario usando keys dinámicas
- Sincronización con backend solo en checkout

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

##  Características Principales

### Usuarios
-  Registro e inicio de sesión
-  Perfil de usuario con cambio de contraseña
-  Carrito de compras persistente
-  Sistema de reseñas con estrellas
-  Foro en tiempo real

### Administradores
-  Crear, editar y eliminar productos
-  Subida de imágenes de productos
-  Gestión de stock (añadir cuando está fuera de stock)
-  Eliminar productos desde cards o vista de edición

### Productos
-  Listado con cards visuales
-  Vista detallada con especificaciones
-  Sistema de calificación con estrellas
-  Filtrado por categoría y marca
-  Validación de stock en tiempo real

### Carrito
-  Agregar/eliminar productos
-  Modificar cantidad (botones +/- o input directo)
-  Validación de stock disponible
-  Cálculo automático del total
-  Checkout con validación final

### Interfaz
-  Diseño responsive
-  Modales para confirmaciones
-  Toasts para notificaciones
-  Página 404 personalizada
-  Navegación intuitiva

##  Notas Adicionales

- El proyecto usa ES Modules (`type: "module"` en package.json)
- Las imágenes se almacenan localmente en `back/uploads/`
- MongoDB debe estar corriendo antes de iniciar el backend

##  Seguridad

- Contraseñas hasheadas con bcryptjs
- Autenticación JWT
- Validación de roles (admin/user)
- Sanitización de inputs
- Validación de stock en múltiples capas

##  Despliegue e Infraestructura

- **Orquestación CI/CD:** Jenkins ejecuta pipelines que analizan el código con SonarQube, construyen imágenes Docker y publican nuevas versiones en el clúster.
- **Entorno de ejecución:** Backend y frontend corren como servicios dentro de un clúster de Kubernetes, aprovechando actualizaciones continuas y escalado.
- **Base de datos:** Ambos servicios consumen una instancia de MongoDB alojada en un servidor externo y accesible mediante credenciales configurables.
- **Exposición del frontend:** El build de Vue se sirve públicamente a través de Nginx, que entrega los archivos generados en `dist/`, accesibles en [https://geeklab.sgomez.dev](https://geeklab.sgomez.dev).


---

**Desarrollado con ❤️ para GeekLab by sgomez-dev**
