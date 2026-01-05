# GeekLab - Backend

Backend de la aplicación GeekLab desarrollado con Node.js y Express.

## Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm start
```

El servidor estará disponible en `http://localhost:4000`

## Estructura del Proyecto

```
back/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── graphql/
│   │   ├── context.js
│   │   ├── resolvers.js
│   │   └── schema.js
│   ├── middleware/
│   │   └── authenticateJWT.js
│   ├── models/
│   │   ├── Message.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── checkoutRoutes.js
│   │   ├── forumRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── productRoutesUpload.js
│   │   └── userRoutes.js
│   ├── server.js
│   └── socket.js
├── uploads/
└── package.json
```

## Tecnologías

- **Node.js 20+** - Entorno de ejecución JavaScript
- **Express.js 5.1** - Framework web moderno
- **MongoDB** - Base de datos NoSQL
- **Mongoose 8.19** - ODM para MongoDB con validación de esquemas
- **Apollo Server 5** - Servidor GraphQL para consultas avanzadas
- **Socket.io 4.8** - Comunicación en tiempo real (WebSocket + polling)
- **@socket.io/redis-adapter** - Adapter para Redis (opcional, para múltiples instancias)
- **ioredis** - Cliente Redis (opcional)
- **JWT (jsonwebtoken 9)** - Autenticación mediante tokens
- **Multer 1.4.5-lts** - Manejo de carga de archivos
- **bcryptjs 2.4** - Encriptación de contraseñas
- **CORS 2.8** - Habilitación de Cross-Origin Resource Sharing
- **http-status-codes** - Constantes para códigos de estado HTTP
- **dotenv** - Gestión de variables de entorno

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz de `back/`:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/GeekLab
# O MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/GeekLab

# Puerto del servidor
PORT=4000

# JWT Secret (¡cambiar en producción con cadena aleatoria segura!)
JWT_SECRET=secreto_jwt_muy_seguro_cambiar_en_produccion

# Redis (opcional, solo para múltiples pods/instancias)
# REDIS_URL=redis://localhost:6379
# O Redis Cloud:
# REDIS_URL=redis://user:password@host:port
```

**Variables importantes:**

- `MONGO_URI`: Cadena de conexión a MongoDB (local, Atlas o servidor remoto)
- `PORT`: Puerto donde correrá el servidor (default: 4000)
- `JWT_SECRET`: Secreto para firmar tokens JWT (debe ser fuerte, único y privado)
- `REDIS_URL` (opcional): URL de Redis para Socket.io Adapter en clúster Kubernetes
  - Solo necesario si despliegas múltiples réplicas del backend
  - Permite que los eventos de Socket.io se propaguen entre todos los pods

### MongoDB

Asegúrate de tener MongoDB corriendo:

**Local:**

```bash
mongod
```

**MongoDB Atlas:**
Usa la cadena de conexión de tu cluster en `MONGO_URI`.

## Endpoints de la API

### Autenticación (`/api/auth`)

- `POST /api/auth/register` - Registro de usuario

  - Body: `{ username, email, password }`
  - Response: `{ message: "User registered successfully" }`

- `POST /api/auth/login` - Inicio de sesión

  - Body: `{ email, password }`
  - Response: `{ token, username, role }`

- `PUT /api/auth/password` - Cambiar contraseña (requiere auth)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ currentPassword, newPassword }`

### Productos (`/api/products`)

- `GET /api/products` - Listar todos los productos

  - Response: Array de productos

- `GET /api/products/ids` - Listar IDs y nombres (debug)

  - Response: Array de `{ _id, name }`

- `GET /api/products/:id` - Obtener producto por ID

  - Response: Objeto producto

- `POST /api/products` - Crear producto (requiere admin)

  - Headers: `Authorization: Bearer <token>`
  - Body: FormData con `name, brand, price, description, category, stock, image`

- `PUT /api/products/:id` - Actualizar producto (requiere admin)

  - Headers: `Authorization: Bearer <token>`
  - Body: FormData con campos a actualizar

- `DELETE /api/products/:id` - Eliminar producto (requiere admin)

  - Headers: `Authorization: Bearer <token>`

- `POST /api/products/:id/reviews` - Agregar/actualizar reseña (requiere auth)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ rating, comment }`
  - Nota: Si el usuario ya tiene una reseña, se actualiza

### Checkout (`/api/checkout`)

- `POST /api/checkout` - Procesar compra (requiere auth)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ items: [{ _id, quantity }] }`
  - Valida stock, crea orden, actualiza stock
  - Emite evento Socket.io `stock:update` si hay cambios

### Foro (`/api/forum`)

- `GET /api/forum` - Obtener mensajes del foro

  - Response: Array de mensajes

- `POST /api/forum` - Crear mensaje (requiere auth)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ content }`
  - Emite evento Socket.io `forum:message` para todos los clientes

### Órdenes (`/api/orders`)

- `GET /api/orders` - Obtener órdenes del usuario (requiere auth)
  - Headers: `Authorization: Bearer <token>`
  - Response: Array de órdenes del usuario autenticado

### Usuarios (`/api/users`)

- `GET /api/users` - Listar todos los usuarios (requiere admin)

  - Headers: `Authorization: Bearer <token>`
  - Response: Array de usuarios sin contraseñas

- `POST /api/users` - Crear nuevo usuario (requiere admin)

  - Headers: `Authorization: Bearer <token>`
  - Body: `{ username, email, password, role }`
  - Response: `{ message: "User created successfully", user }`

- `GET /api/users/:id` - Obtener usuario por ID (requiere admin)

  - Headers: `Authorization: Bearer <token>`
  - Response: Objeto usuario sin contraseña

- `PUT /api/users/:id/role` - Cambiar rol de usuario (requiere admin)

  - Headers: `Authorization: Bearer <token>`
  - Body: `{ role: "user" | "admin" }`
  - Response: `{ message: "User role updated successfully", user }`

- `DELETE /api/users/:id` - Eliminar usuario (requiere admin)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: "User deleted successfully" }`

### GraphQL (`/graphql`)

- `POST /graphql` - Endpoint GraphQL para consultas y mutaciones

  - Headers: `Authorization: Bearer <token>` (opcional, según la query)
  - Body: `{ query, variables, operationName }`
  - Proporciona acceso flexible a productos, usuarios, órdenes y más
  - Ver [GRAPHQL_DOCUMENTATION.md](../GRAPHQL_DOCUMENTATION.md) para queries disponibles

- `GET /graphql` - Información del endpoint GraphQL
  - Response: `{ message, introspection: true }`

## Autenticación y Autorización

### Middleware `authenticateJWT`

Verifica el token JWT en el header `Authorization: Bearer <token>`.

- Si el token es válido: añade `req.user` con `{ id, role, username }`
- Si el token es inválido o no existe: retorna 401 Unauthorized

### Roles

- **user**: Usuario normal (por defecto)
- **admin**: Administrador (puede crear/editar/eliminar productos)

### Protección de Rutas

Las rutas protegidas verifican:

1. Token JWT válido (middleware `authenticateJWT`)
2. Rol de admin (si aplica): `req.user.role === 'admin'`

## Modelos de Datos

### User

```javascript
{
  username: String (único, requerido),
  email: String (único, requerido),
  password: String (hasheado, requerido),
  role: String (enum: ['user', 'admin'], default: 'user')
}
```

### Product

```javascript
{
  name: String (requerido),
  brand: String,
  price: Number (requerido),
  description: String,
  category: String,
  stock: Number (default: 0),
  image: String (ruta a imagen),
  reviews: [{
    userId: ObjectId,
    username: String,
    rating: Number (1-5),
    comment: String,
    createdAt: Date
  }],
  averageRating: Number (calculado),
  numReviews: Number (calculado)
}
```

### Order

```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  createdAt: Date
}
```

### Message

```javascript
{
  userId: ObjectId (ref: User),
  username: String,
  content: String,
  createdAt: Date
}
```

## Socket.io

### Configuración

- **Transports:** WebSocket (preferido) + polling (fallback)
- **CORS:** Configurado para orígenes permitidos
- **Timeouts:** ping 60s, interval 25s
- **Redis Adapter:** Opcional para múltiples instancias (configurar con `REDIS_URL`)

### Eventos Emitidos por el Servidor

- `forum:new` - Nuevo mensaje en el foro

  - Payload: `{ _id, userId, username, content, createdAt }`
  - Broadcast: Todos los clientes conectados
  - Trigger: Cuando se crea un mensaje vía POST `/api/forum/messages`

- `stock:update` - Actualización de stock después de compra
  - Payload: `{ productId: String, stock: Number }`
  - Broadcast: Todos los clientes conectados
  - Trigger: Después de un checkout exitoso
  - Uso: Frontend actualiza el catálogo en tiempo real

### Eventos Escuchados por Clientes

Los clientes (frontend) deben registrar listeners para:

- `connect` - Cuando se establece conexión
- `disconnect` - Cuando se pierde conexión
- `forum:new` - Para recibir mensajes del foro en tiempo real
- `stock:update` - Para actualizar stock en catálogo sin recargar

### Ejemplo de Uso en Cliente

```javascript
import { io } from "socket.io-client";

const socket = io("https://geeklab-back.sgomez.dev", {
  transports: ["websocket", "polling"],
  reconnection: true,
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("forum:new", (message) => {
  console.log("New message:", message);
  // Agregar mensaje al array de mensajes
});

socket.on("stock:update", ({ productId, stock }) => {
  console.log("Stock updated:", productId, stock);
  // Actualizar stock en catálogo
});
```

## Manejo de Archivos

### Multer Configuration

- **Destino:** `back/uploads/` (se crea automáticamente si no existe)
- **Nombres únicos:** `timestamp-random-originalname`
  - Ejemplo: `1699512345678-123456789-mouse.jpg`
- **Ruta almacenada en BD:** `/uploads/filename.jpg`
- **Límite de tamaño:** 10MB por archivo
- **Tipos aceptados:** Todos (validar en frontend para imágenes)

### Servir Archivos Estáticos

Los archivos se sirven con middleware especial que incluye:

- Headers CORS para evitar bloqueos ERR_BLOCKED_BY_ORB
- `Cross-Origin-Resource-Policy: cross-origin`
- Headers de caché para optimizar rendimiento
- Logging de HIT/MISS para depuración

**URLs de acceso:**

```
http://localhost:4000/uploads/filename.jpg (desarrollo)
https://geeklab-back.sgomez.dev/uploads/filename.jpg (producción)
```

### Endpoint de Diagnóstico

- `GET /api/products/debug/images` - Lista productos y verifica existencia de archivos
  - Response: `{ uploadsDir, products: [{ productId, productName, imageInDB, fullPath, exists }] }`
  - Útil para depurar problemas de imágenes 404

## Pruebas

### Pruebas Manuales con Postman/cURL

#### 1. Registro

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

#### 2. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 3. Obtener Productos

```bash
curl http://localhost:4000/api/products
```

#### 4. Crear Producto (requiere token admin)

```bash
curl -X POST http://localhost:4000/api/products \
  -H "Authorization: Bearer <token>" \
  -F "name=Producto Test" \
  -F "brand=Marca" \
  -F "price=99.99" \
  -F "stock=10" \
  -F "description=Descripción" \
  -F "category=Categoría" \
  -F "image=@/path/to/image.jpg"
```

#### 5. Agregar Reseña

```bash
curl -X POST http://localhost:4000/api/products/:id/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Excelente producto"}'
```

## Seguridad

### Implementado

- Contraseñas hasheadas con bcryptjs (salt rounds: 10)
- Tokens JWT con expiración (2 horas)
- Validación de roles (admin/user)
- Middleware de autenticación en rutas protegidas
- Validación de stock antes de checkout
- Sanitización básica de inputs

## Despliegue

### Docker

El proyecto incluye un `Dockerfile` para contenerización:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["node", "src/server.js"]
```

### Kubernetes

Desplegado en clúster con:

- Service type LoadBalancer o Ingress
- Variables de entorno configuradas en ConfigMap/Secrets
- Volumen persistente para `/uploads` (recomendado)
- HorizontalPodAutoscaler para escalado automático (opcional)

### CI/CD con Jenkins

Pipeline incluye:

1. Análisis de código con SonarQube
2. Build de imagen Docker
3. Push a registry
4. Deploy a Kubernetes
5. Health checks

Ver `Jenkinsfile` para detalles completos.

## Notas de Desarrollo

- El proyecto usa **ES Modules** (`type: "module"`)
- Requiere Node.js 20 o superior
- MongoDB debe estar corriendo y accesible antes de iniciar
- El directorio `uploads/` se crea automáticamente en el primer inicio
- Los logs incluyen información detallada para depuración
- **Express 5** con sintaxis moderna
- **Mongoose** para modelado de datos
- **Socket.io** para comunicación bidireccional
- Rutas específicas deben ir **antes** de rutas dinámicas
- La ruta `/products/:id/reviews` debe ir antes de `/products/:id`

## Despliegue e Infraestructura

- **Orquestación CI/CD:** Automatizado con pipelines de Jenkins que ejecutan análisis de SonarQube, construyen imágenes Docker y actualizan los despliegues.
- **Entorno de ejecución:** El backend corre como un servicio dentro de un clúster de Kubernetes, con actualizaciones continuas gestionadas mediante `kubectl set image`.
- **Base de datos:** Se conecta a una instancia administrada de MongoDB expuesta desde un servidor externo, usando credenciales definidas por variables de entorno.
- **Integración con el frontend:** El frontend en Vue.js se construye por separado y se sirve públicamente a través de un Nginx; consume este backend mediante los endpoints `/api`.

---

Para más información sobre el proyecto completo, consulta el [README principal](../README.md).
