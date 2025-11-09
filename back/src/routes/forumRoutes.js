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

    const plain = msg.toObject({ versionKey: false });
    console.log('[Forum] Message created:', plain._id, 'by', plain.username);

        const io = getIO();
        if (io) {
            const clients = io.engine?.clientsCount ?? 'unknown';
            console.log('[Forum] Broadcasting forum:new to all clients:', clients);
            io.emit('forum:new', plain);
        } else {
            console.error('[Forum] IO instance not available for broadcast');
        }

        res.status(StatusCodes.CREATED).json(plain);
    } catch (error) {
        console.error('[Forum] Error creating message:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating message' });
    }
});

export default router;
