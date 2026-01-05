import express from 'express';
import StatusCodes from 'http-status-codes';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import Order from '../models/Order.js';

const router = express.Router();

// user: list own orders
router.get('/my', authenticateJWT, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user.id };
    if (status && ['pending', 'completed'].includes(status)) {
      query.status = status;
    }
    const orders = await Order.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

// admin: list all orders with optional status filter
router.get('/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    }
    
    const { status } = req.query;
    const query = {};
    if (status && ['pending', 'completed'].includes(status)) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

// Get order details by ID (admin or owner)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'username email');
    
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Order not found' });
    }
    
    // User can only see their own orders, admin can see all
    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    }
    
    const { status } = req.body;
    if (!status || !['pending', 'completed'].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid status. Must be "pending" or "completed"' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'username email');
    
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

export default router;
