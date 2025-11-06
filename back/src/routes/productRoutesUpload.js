import express from 'express';
import Product from '../models/Product.js';
import StatusCodes from 'http-status-codes';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// compute uploads path for storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

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
