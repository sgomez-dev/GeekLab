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

##  Estructura del Proyecto

```
back/
├── src/
│   ├── config/           
│   │   └── db.js        
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
│   │   └── productRoutesUpload.js 
│   ├── server.js       
│   └── socket.js      
├── uploads/         
└── package.json
```

##  Tecnologías

- **Node.js** - Entorno de ejecución JavaScript
- **Express.js 5** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Socket.io** - Comunicación en tiempo real
- **JWT** - Autenticación mediante tokens
- **Multer** - Manejo de carga de archivos
- **bcryptjs** - Encriptación de contraseñas
- **CORS** - Habilitación de Cross-Origin Resource Sharing

##  Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz de `back/`:

```env
MONGO_URI=mongodb://localhost:27017/GeekLab
PORT=4000
JWT_SECRET=secreto_jwt_muy_seguro_aqui
```

**Importante:**
- `MONGO_URI`: Cadena de conexión a MongoDB (local o remoto)
- `PORT`: Puerto donde correrá el servidor (default: 4000)
- `JWT_SECRET`: Secreto para firmar tokens JWT (debe ser fuerte y único)

### MongoDB

Asegúrate de tener MongoDB corriendo:

**Local:**
```bash
mongod
```

**MongoDB Atlas:**
Usa la cadena de conexión de tu cluster en `MONGO_URI`.

##  Endpoints de la API

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

##  Autenticación y Autorización

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

##  Modelos de Datos

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

##  Socket.io

### Eventos Emitidos

- `forum:message` - Nuevo mensaje en el foro
  - Payload: `{ userId, username, content, createdAt }`

- `stock:update` - Actualización de stock
  - Payload: `{ productId, stock }`

### Eventos Escuchados

- `forum:message` - Clientes escuchan nuevos mensajes

##  Manejo de Archivos

### Multer Configuration

- **Destino:** `back/uploads/`
- **Nombres únicos:** `timestamp-random-originalname`
- **Ruta pública:** `/uploads/filename.jpg`
- **Tipos aceptados:** Imágenes (validar en frontend)

### Servir Archivos Estáticos

Los archivos en `uploads/` se sirven en:
```
http://localhost:4000/uploads/filename.jpg
```

##  Pruebas

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

##  Seguridad

### Implementado

-  Contraseñas hasheadas con bcryptjs (salt rounds: 10)
-  Tokens JWT con expiración (2 horas)
-  Validación de roles (admin/user)
-  Middleware de autenticación en rutas protegidas
-  Validación de stock antes de checkout
-  Sanitización básica de inputs

##  Notas de Desarrollo

- El proyecto usa **ES Modules** (`type: "module"`)
- **Express 5** con sintaxis moderna
- **Mongoose** para modelado de datos
- **Socket.io** para comunicación bidireccional
- Rutas específicas deben ir **antes** de rutas dinámicas
- La ruta `/products/:id/reviews` debe ir antes de `/products/:id`

##  Despliegue e Infraestructura

- **Orquestación CI/CD:** Automatizado con pipelines de Jenkins que ejecutan análisis de SonarQube, construyen imágenes Docker y actualizan los despliegues.
- **Entorno de ejecución:** El backend corre como un servicio dentro de un clúster de Kubernetes, con actualizaciones continuas gestionadas mediante `kubectl set image`.
- **Base de datos:** Se conecta a una instancia administrada de MongoDB expuesta desde un servidor externo, usando credenciales definidas por variables de entorno.
- **Integración con el frontend:** El frontend en Vue.js se construye por separado y se sirve públicamente a través de un Nginx; consume este backend mediante los endpoints `/api`.

---


Para más información sobre el proyecto completo, consulta el [README principal](../README.md).

