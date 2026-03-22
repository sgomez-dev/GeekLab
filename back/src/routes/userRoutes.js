import express from 'express';
import StatusCodes from 'http-status-codes';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware para verificar que es admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied. Admin role required.' });
    }
    next();
};

// Crear nuevo usuario (admin only)
router.post('/', authenticateJWT, requireAdmin, async (req, res) => {
    console.log('[POST /api/users] Creating new user:', req.body);
    try {
        const { username, email, password, role } = req.body;
        
        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username, email and password are required' });
        }

        if (password.length < 6) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password must be at least 6 characters' });
        }

        const userRole = role && ['user', 'admin'].includes(role) ? role : 'user';

        const user = new User({ username, email, password, role: userRole });
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: userResponse });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(StatusCodes.BAD_REQUEST).json({ message: `${field} already exists` });
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Listar todos los usuarios (admin only)
router.get('/', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Obtener un usuario por ID (admin only)
router.get('/:id', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Actualizar usuario (admin only): username, email, contraseña opcional, rol
router.put('/:id', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;

        const wantsUsername = username !== undefined && username !== null;
        const wantsEmail = email !== undefined && email !== null;
        const wantsPassword = password !== undefined && password !== null && String(password).length > 0;
        const wantsRole = role !== undefined && role !== null;

        if (!wantsUsername && !wantsEmail && !wantsPassword && !wantsRole) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No fields to update' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        if (wantsUsername) {
            const u = String(username).trim();
            if (!u) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username cannot be empty' });
            user.username = u;
        }
        if (wantsEmail) {
            const e = String(email).trim().toLowerCase();
            if (!e) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email cannot be empty' });
            user.email = e;
        }
        if (wantsPassword) {
            if (String(password).length < 6) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password must be at least 6 characters' });
            }
            user.password = password;
        }
        if (wantsRole) {
            if (!['user', 'admin'].includes(role)) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid role. Must be "user" or "admin"' });
            }
            if (String(id) === String(req.user.id)) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cannot change your own role' });
            }
            user.role = role;
        }

        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ message: 'User updated successfully', user: userResponse });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(StatusCodes.BAD_REQUEST).json({ message: `${field} already exists` });
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Cambiar rol de usuario (admin only)
router.put('/:id/role', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid role. Must be "user" or "admin"' });
        }

        // No permitir cambiar el rol del propio usuario
        if (req.params.id === req.user.id) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cannot change your own role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        res.json({ message: 'User role updated successfully', user });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

// Eliminar usuario (admin only)
router.delete('/:id', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        // No permitir eliminar el propio usuario
        if (req.params.id === req.user.id) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

export default router;

