import jwt from 'jsonwebtoken';
import StatusCodes from 'http-status-codes';

export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // must include at least id, username, role in payload
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token expired' });
        }
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid token' });
    }
};