export const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    role: String!
  }

  type OrderItem {
    productId: ID!
    name: String!
    price: Float!
    quantity: Int!
  }

  type Order {
    _id: ID!
    userId: User!
    items: [OrderItem!]!
    total: Float!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

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

  type Query {
    # Productos
    products: [Product!]!
    product(id: ID!): Product

    # Pedidos
    orders(status: String): [Order!]!
    order(id: ID!): Order
    myOrders(status: String): [Order!]!
  }

  type Mutation {
    # Pedidos
    createOrder(items: [OrderItemInput!]!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
  }

  input OrderItemInput {
    productId: ID!
    name: String!
    price: Float!
    quantity: Int!
  }
`;

