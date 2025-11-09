import express from 'express';
import Product from '../models/Product.js';
import StatusCodes from 'http-status-codes';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const router = express.Router();

// compute uploads path for storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');
// ensure uploads directory exists
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`[uploads] Created directory for multer: ${uploadsDir}`);
    }
} catch (e) {
    console.error('[uploads] Failed to ensure uploads directory for multer:', e);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// list products
router.get('/', async (req, res) => {
    const products = await Product.find();
    res.json(products);
})

// helper: list product ids and names (debug)
router.get('/ids', async (req, res) => {
    try {
        const products = await Product.find({}, { name: 1 });
        // return array of { _id, name }
        res.json(products.map(p => ({ _id: p._id, name: p.name })));
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching ids' });
    }
});

// diagnostic endpoint: check image files
router.get('/debug/images', async (req, res) => {
    try {
        const products = await Product.find({}, { name: 1, image: 1 });
        const results = products.map(p => {
            let imagePath = p.image || '';
            if (imagePath.startsWith('/uploads/')) {
                imagePath = imagePath.replace('/uploads/', '');
            }
            const fullPath = path.join(uploadsDir, imagePath);
            const exists = fs.existsSync(fullPath);
            return {
                productId: p._id,
                productName: p.name,
                imageInDB: p.image,
                fullPath: fullPath,
                exists: exists
            };
        });
        res.json({
            uploadsDir: uploadsDir,
            products: results
        });
    } catch (error) {
        console.error('[debug] Error checking images', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error checking images' });
    }
});

// add or update a review for a product (authenticated users) - MUST be before /:id route
router.post('/:id/reviews', authenticateJWT, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || !comment) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Rating and comment are required' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found' });

        // Check if user already reviewed
        const existingIndex = product.reviews.findIndex(r => r.userId?.toString() === req.user.id);
        if (existingIndex !== -1) {
            product.reviews[existingIndex].rating = rating;
            product.reviews[existingIndex].comment = comment;
            product.reviews[existingIndex].createdAt = new Date();
        } else {
            product.reviews.push({
                userId: req.user.id,
                username: req.user.username || 'Usuario',
                rating,
                comment,
            });
        }

        // Dedupe reviews by userId (keep latest)
        const map = new Map();
        for (const r of product.reviews) {
            map.set(String(r.userId), r);
        }
        product.reviews = Array.from(map.values()).sort((a,b) => a.createdAt - b.createdAt);
        // Recalculate average and count
        product.numReviews = product.reviews.length;
        product.averageRating = product.numReviews === 0 ? 0 : product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.numReviews;

        await product.save();
        res.status(StatusCodes.CREATED).json(product);
    } catch (error) {
        console.error('Error adding review', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error adding review' });
    }
});

// get product by id
router.get('/:id', async (req, res) => {
    try {
        console.log(`[products] GET /:id -> id=${req.params.id}`);
        const product = await Product.findById(req.params.id);
        if (!product) {
            console.log(`[products] Product not found id=${req.params.id}`);
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found' });
        }
        console.log(`[products] Product found id=${req.params.id}`);
        res.json(product);
    } catch (error) {
        console.error('[products] Error fetching product by id', error);
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid product id' });
    }
});

// create product (admin only)
router.post('/', authenticateJWT, upload.single('image'), async (req, res) => {
    if (req.user.role !== 'admin') return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    const productData = { ...req.body };
    if (req.file) {
        // store the public path to the uploaded file
        productData.image = `/uploads/${req.file.filename}`;
    }
    const product = new Product(productData);
    await product.save();
    res.status(StatusCodes.CREATED).json(product);
});

// update product (admin only)
router.put('/:id', authenticateJWT, upload.single('image'), async (req, res) => {
    if (req.user.role !== 'admin') return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
});

// delete product (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
});

export default router;
