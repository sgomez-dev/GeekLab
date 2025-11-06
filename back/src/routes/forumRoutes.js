import express from 'express';
import StatusCodes from 'http-status-codes';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import Message from '../models/Message.js';
import { getIO } from '../socket.js';

const router = express.Router();

// list messages (most recent first, limit 100)
router.get('/messages', async (req, res) => {
    const messages = await Message.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(messages.reverse()); // oldest first for display
});

// post new message
router.post('/messages', authenticateJWT, async (req, res) => {
    try {
        const content = (req.body?.content || '').trim();
        if (!content) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Content is required' });
        const msg = await Message.create({
            userId: req.user.id,
            username: req.user.username,
            content,
        });
        // broadcast via socket
        const io = getIO();
        if (io) io.emit('forum:new', msg);
        res.status(StatusCodes.CREATED).json(msg);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating message' });
    }
});

export default router;
