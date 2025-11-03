import express from 'express';
import Product from '../models/Product.js';
import StatusCodes from 'http-status-codes';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// list products
router.get('/', async (req, res) => {
    const products = await Product.find();
    res.json(products);
})

// create product (admin only)
router.post('/', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    const product = new Product(req.body);
    await product.save();
    res.status(StatusCodes.CREATED).json(product);
});

// update product (admin only)
router.put('/:id', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
});

// delete product (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
});

export default router;