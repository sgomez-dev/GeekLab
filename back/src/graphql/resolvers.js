import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import StatusCodes from 'http-status-codes';
import { getIO } from '../socket.js';

export const resolvers = {
  Query: {
    // Obtener todos los productos
    products: async () => {
      try {
        return await Product.find({});
      } catch (error) {
        throw new Error('Error fetching products: ' + error.message);
      }
    },

    // Obtener un producto por ID
    product: async (_, { id }) => {
      try {
        const product = await Product.findById(id);
        if (!product) {
          throw new Error('Product not found');
        }
        return product;
      } catch (error) {
        throw new Error('Error fetching product: ' + error.message);
      }
    },

    // Obtener todos los pedidos (admin only)
    orders: async (_, { status }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      if (context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const query = {};
        if (status && ['pending', 'completed'].includes(status)) {
          query.status = status;
        }
        return await Order.find(query)
          .populate('userId', 'username email')
          .sort({ createdAt: -1 });
      } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
      }
    },

    // Obtener un pedido por ID (admin o owner)
    order: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        const order = await Order.findById(id).populate('userId', 'username email');
        if (!order) {
          throw new Error('Order not found');
        }

        // User can only see their own orders, admin can see all
        if (context.user.role !== 'admin' && order.userId._id.toString() !== context.user.id) {
          throw new Error('Access denied');
        }

        return order;
      } catch (error) {
        throw new Error('Error fetching order: ' + error.message);
      }
    },

    // Obtener pedidos del usuario autenticado
    myOrders: async (_, { status }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        const query = { userId: context.user.id };
        if (status && ['pending', 'completed'].includes(status)) {
          query.status = status;
        }
        return await Order.find(query)
          .populate('userId', 'username email')
          .sort({ createdAt: -1 });
      } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
      }
    },
  },

  Mutation: {
    // Crear un nuevo pedido
    createOrder: async (_, { items }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        if (!Array.isArray(items) || items.length === 0) {
          throw new Error('No items to checkout');
        }

        const insufficientStock = [];
        const orderItems = [];
        let total = 0;

        // Verificar stock disponible y preparar snapshot
        for (const item of items) {
          const product = await Product.findById(item.productId);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          if (product.stock < item.quantity) {
            insufficientStock.push({
              product: product.name,
              requested: item.quantity,
              available: product.stock,
            });
          } else {
            orderItems.push({
              productId: product._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            });
            total += item.price * item.quantity;
          }
        }

        if (insufficientStock.length > 0) {
          throw new Error(
            'Insufficient stock: ' +
              insufficientStock.map((s) => `${s.product} (requested: ${s.requested}, available: ${s.available})`).join(', ')
          );
        }

        // Actualizar stock y obtener nuevos valores
        const updates = await Promise.all(
          items.map((item) =>
            Product.findByIdAndUpdate(
              item.productId,
              { $inc: { stock: -item.quantity } },
              { new: true }
            )
          )
        );

        // Emitir eventos de actualización de stock
        const io = getIO();
        if (io) {
          const clients = io.engine?.clientsCount ?? 'unknown';
          console.log('[GraphQL Checkout] Emitting stock updates to', clients, 'clients');
          updates.forEach((p) => {
            if (p) {
              const payload = { productId: String(p._id), stock: p.stock };
              console.log('[GraphQL Checkout] Emitting stock:update', payload);
              io.emit('stock:update', payload);
            }
          });
        }

        // Crear la orden con status 'pending' por defecto
        const order = await Order.create({
          userId: context.user.id,
          items: orderItems,
          total,
          status: 'pending',
        });

        return await Order.findById(order._id).populate('userId', 'username email');
      } catch (error) {
        throw new Error('Error creating order: ' + error.message);
      }
    },

    // Actualizar estado de un pedido (admin only)
    updateOrderStatus: async (_, { id, status }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      if (context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        if (!status || !['pending', 'completed'].includes(status)) {
          throw new Error('Invalid status. Must be "pending" or "completed"');
        }

        const order = await Order.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        ).populate('userId', 'username email');

        if (!order) {
          throw new Error('Order not found');
        }

        return order;
      } catch (error) {
        throw new Error('Error updating order status: ' + error.message);
      }
    },
  },
};

