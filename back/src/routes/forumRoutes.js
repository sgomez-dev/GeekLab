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
        
        console.log('[Forum] Message created:', msg._id, 'by', msg.username);
        
        // broadcast via socket
        const io = getIO();
        if (io) {
            console.log('[Forum] Emitting forum:new event to all clients');
            io.emit('forum:new', msg.toObject());
            console.log('[Forum] Event emitted successfully');
        } else {
            console.error('[Forum] IO instance not available!');
        }
        
        res.status(StatusCodes.CREATED).json(msg);
    } catch (error) {
        console.error('[Forum] Error creating message:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating message' });
    }
});

export default router;
