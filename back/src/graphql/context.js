import jwt from 'jsonwebtoken';

export const createContext = async ({ req }) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      user: {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username,
      },
    };
  } catch (error) {
    return { user: null };
  }
};

