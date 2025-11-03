import jwt from 'jsonwebtoken';
import StatusCodes from 'http-status-codes';

export const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid token' });
    }
}