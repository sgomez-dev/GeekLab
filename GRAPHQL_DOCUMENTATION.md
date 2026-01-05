# Documentación GraphQL - GeekLab

## Endpoint

El servidor GraphQL está disponible en: `https://geeklab-back.sgomez.dev/graphql`

## Autenticación

Todas las queries y mutations requieren autenticación mediante JWT. Incluye el token en el header:

```
Authorization: Bearer <token>
```

## Tipos de Datos

### User
```graphql
type User {
  _id: ID!
  username: String!
  email: String!
  role: String!
}
```

### Product
```graphql
type Product {
  _id: ID!
  name: String!
  brand: String
  price: Float!
  description: String
  category: String
  stock: Int!
  image: String
  averageRating: Float
  numReviews: Int
}
```

### OrderItem
```graphql
type OrderItem {
  productId: ID!
  name: String!
  price: Float!
  quantity: Int!
}
```

### Order
```graphql
type Order {
  _id: ID!
  userId: User!
  items: [OrderItem!]!
  total: Float!
  status: String!  # "pending" o "completed"
  createdAt: String!
  updatedAt: String!
}
```

## Queries

### products

Obtiene todos los productos disponibles.

**No requiere autenticación**

```graphql
query {
  products {
    _id
    name
    brand
    price
    description
    category
    stock
    image
    averageRating
    numReviews
  }
}
```

**Ejemplo de respuesta:**
```json
{
  "data": {
    "products": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Producto Ejemplo",
        "brand": "Marca",
        "price": 99.99,
        "stock": 10,
        "image": "image.jpg"
      }
    ]
  }
}
```

### product

Obtiene un producto específico por ID.

**No requiere autenticación**

```graphql
query {
  product(id: "60f7b3b3b3b3b3b3b3b3b3b3b3") {
    _id
    name
    brand
    price
    stock
    description
  }
}
```

### orders

Obtiene todos los pedidos (solo administradores).

**Requiere autenticación y rol admin**

```graphql
query {
  orders(status: "pending") {
    _id
    userId {
      username
      email
    }
    items {
      productId
      name
      price
      quantity
    }
    total
    status
    createdAt
  }
}
```

**Parámetros opcionales:**
- `status`: Filtrar por estado ("pending" o "completed")

### order

Obtiene un pedido específico por ID.

**Requiere autenticación (admin o propietario del pedido)**

```graphql
query {
  order(id: "60f7b3b3b3b3b3b3b3b3b3b3b3") {
    _id
    userId {
      username
      email
    }
    items {
      name
      price
      quantity
    }
    total
    status
    createdAt
  }
}
```

### myOrders

Obtiene los pedidos del usuario autenticado.

**Requiere autenticación**

```graphql
query {
  myOrders(status: "pending") {
    _id
    items {
      name
      price
      quantity
    }
    total
    status
    createdAt
  }
}
```

**Parámetros opcionales:**
- `status`: Filtrar por estado ("pending" o "completed")

## Mutations

### createOrder

Crea un nuevo pedido a partir de los items del carrito.

**Requiere autenticación**

```graphql
mutation {
  createOrder(items: [
    {
      productId: "60f7b3b3b3b3b3b3b3b3b3b3b3"
      name: "Producto 1"
      price: 99.99
      quantity: 2
    },
    {
      productId: "60f7b3b3b3b3b3b3b3b3b3b3b4"
      name: "Producto 2"
      price: 49.99
      quantity: 1
    }
  ]) {
    _id
    total
    status
    items {
      name
      price
      quantity
    }
    createdAt
  }
}
```

**Input:**
- `items`: Array de `OrderItemInput` con los productos a comprar

**Comportamiento:**
- Valida el stock disponible de cada producto
- Si hay stock insuficiente, lanza un error
- Actualiza el stock de los productos
- Crea el pedido con estado "pending" por defecto
- Emite eventos Socket.IO para actualizar el stock en tiempo real

**Ejemplo de respuesta exitosa:**
```json
{
  "data": {
    "createOrder": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3b5",
      "total": 249.97,
      "status": "pending",
      "items": [
        {
          "name": "Producto 1",
          "price": 99.99,
          "quantity": 2
        }
      ],
      "createdAt": "2026-01-04T15:30:00.000Z"
    }
  }
}
```

**Ejemplo de error (stock insuficiente):**
```json
{
  "errors": [
    {
      "message": "Error creating order: Insufficient stock: Producto 1 (requested: 10, available: 5)"
    }
  ]
}
```

### updateOrderStatus

Actualiza el estado de un pedido (solo administradores).

**Requiere autenticación y rol admin**

```graphql
mutation {
  updateOrderStatus(
    id: "60f7b3b3b3b3b3b3b3b3b3b3b3b3"
    status: "completed"
  ) {
    _id
    status
    updatedAt
  }
}
```

**Input:**
- `id`: ID del pedido a actualizar
- `status`: Nuevo estado ("pending" o "completed")

## Ejemplos de Uso Completo

### Flujo de Compra Completo

1. **Obtener productos disponibles:**
```graphql
query {
  products {
    _id
    name
    price
    stock
  }
}
```

2. **Crear pedido:**
```graphql
mutation {
  createOrder(items: [
    { productId: "60f7b3b3b3b3b3b3b3b3b3b3b3", name: "Producto", price: 99.99, quantity: 1 }
  ]) {
    _id
    total
    status
  }
}
```

3. **Ver mis pedidos:**
```graphql
query {
  myOrders {
    _id
    total
    status
    items {
      name
      quantity
    }
  }
}
```

### Gestión de Pedidos (Admin)

1. **Listar todos los pedidos pendientes:**
```graphql
query {
  orders(status: "pending") {
    _id
    userId {
      username
      email
    }
    total
    status
  }
}
```

2. **Ver detalle de un pedido:**
```graphql
query {
  order(id: "60f7b3b3b3b3b3b3b3b3b3b3b3") {
    _id
    userId {
      username
      email
    }
    items {
      name
      price
      quantity
    }
    total
    status
  }
}
```

3. **Marcar pedido como completado:**
```graphql
mutation {
  updateOrderStatus(id: "60f7b3b3b3b3b3b3b3b3b3b3b3", status: "completed") {
    _id
    status
  }
}
```

## Decisiones de Diseño

### ¿Por qué GraphQL para pedidos y productos?

1. **Flexibilidad**: El cliente puede solicitar exactamente los campos que necesita
2. **Eficiencia**: Una sola query puede obtener productos con sus relaciones
3. **Type Safety**: El schema define claramente los tipos y relaciones
4. **Integración**: Apollo Client facilita el manejo de estado y caché

### Coexistencia con REST

- **REST se mantiene** para autenticación y otras operaciones
- **GraphQL se usa** para operaciones de lectura (Queries) y creación de pedidos (Mutations)
- El frontend puede elegir usar GraphQL o REST según la operación

### Estados de Pedidos

- **pending**: Pedido creado pero no completado (estado inicial)
- **completed**: Pedido completado (marcado por admin)

El estado inicial siempre es "pending" y solo los administradores pueden cambiarlo a "completed".

## Errores Comunes

### Error: "Authentication required"
- **Causa**: No se incluyó el token JWT en el header
- **Solución**: Asegúrate de incluir `Authorization: Bearer <token>`

### Error: "Admin access required"
- **Causa**: Intentaste acceder a una query/mutation que requiere rol admin
- **Solución**: Verifica que tu usuario tenga rol "admin"

### Error: "Insufficient stock"
- **Causa**: Intentaste comprar más productos de los disponibles
- **Solución**: Verifica el stock disponible antes de crear el pedido

