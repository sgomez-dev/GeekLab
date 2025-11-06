import express from 'express';
import StatusCodes from 'http-status-codes';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import Order from '../models/Order.js';

const router = express.Router();

// user: list own orders
router.get('/my', authenticateJWT, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

// admin: list all orders (optional)
router.get('/', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
});

export default router;
