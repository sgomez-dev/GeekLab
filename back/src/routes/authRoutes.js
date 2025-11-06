import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StatusCodes from 'http-status-codes';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

// register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const user = new User({ username, email, password, role });
        await user.save();
        res.status(StatusCodes.CREATED).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
});

// login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email});
    if (!user || !(await user.matchPassword(password)))
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
        { id: user._id, role: user.role, username: user.username},
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );
    res.json({ token, username: user.username, role: user.role });
});

// change password (authenticated)
router.put('/password', authenticateJWT, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password must be at least 6 characters' });
        }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized: missing user id' });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized: user not found' });
        user.password = password; // hashed by pre-save hook
        await user.save();
        return res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error updating password' });
    }
});

export default router;