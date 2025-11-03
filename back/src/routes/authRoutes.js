import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StatusCodes from 'http-status-codes';

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

export default router;