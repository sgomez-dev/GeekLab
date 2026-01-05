import express from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import StatusCodes from 'http-status-codes';
import { getIO } from '../socket.js';

const router = express.Router();

router.post('/', authenticateJWT, async (req, res) => {
    try {
        const items = req.body.items || [];
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No items to checkout' });
        }

        const insufficientStock = [];
        const orderItems = [];
        let total = 0;

        // Verificar stock disponible y preparar snapshot
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: `Producto no encontrado: ${item._id}` });
            }
            if (product.stock < item.quantity) {
                insufficientStock.push({
                    product: product.name,
                    requested: item.quantity,
                    available: product.stock
                });
            } else {
                orderItems.push({
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                });
                total += product.price * item.quantity;
            }
        }

        if (insufficientStock.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Stock insuficiente',
                details: insufficientStock
            });
        }

        // Actualizar stock y obtener nuevos valores
        const updates = await Promise.all(
            items.map((item) =>
                Product.findByIdAndUpdate(
                    item._id,
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                )
            )
        );

        // Emitir eventos de actualización de stock
        const io = getIO();
        if (io) {
            const clients = io.engine?.clientsCount ?? 'unknown';
            console.log('[Checkout] Emitting stock updates to', clients, 'clients');
            updates.forEach((p) => {
                if (p) {
                    const payload = { productId: String(p._id), stock: p.stock };
                    console.log('[Checkout] Emitting stock:update', payload);
                    io.emit('stock:update', payload);
                }
            });
        } else {
            console.error('[Checkout] IO instance not available for stock updates');
        }

        // Crear la orden con status 'pending' por defecto
        const order = await Order.create({ userId: req.user.id, items: orderItems, total, status: 'pending' });

        return res.json({
            message: 'Compra realizada con éxito',
            order
        });
    } catch (error) {
        console.error('Checkout error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error al procesar la compra',
            error: error.message
        });
    }
});

export default router;