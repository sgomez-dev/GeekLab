import express from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import Product from '../models/Product.js';
import StatusCodes from 'http-status-codes';

const router = express.Router();

router.post('/', authenticateJWT, async (req, res) => {
    const session = await Product.startSession();
    session.startTransaction();

    try {
        const items = req.body.items;
        const updates = [];
        const insufficientStock = [];

        // Verificar stock disponible
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) {
                throw new Error(`Producto no encontrado: ${item._id}`);
            }
            if (product.stock < item.quantity) {
                insufficientStock.push({
                    product: product.name,
                    requested: item.quantity,
                    available: product.stock
                });
            }
        }

        if (insufficientStock.length > 0) {
            await session.abortTransaction();
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Stock insuficiente',
                details: insufficientStock
            });
        }

        // Actualizar stock
        for (const item of items) {
            updates.push(
                Product.findByIdAndUpdate(
                    item._id,
                    { $inc: { stock: -item.quantity } },
                    { session, new: true }
                )
            );
        }

        const updatedProducts = await Promise.all(updates);
        await session.commitTransaction();

        res.json({
            message: 'Compra realizada con éxito',
            products: updatedProducts
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error al procesar la compra',
            error: error.message
        });
    } finally {
        session.endSession();
    }
});

export default router;