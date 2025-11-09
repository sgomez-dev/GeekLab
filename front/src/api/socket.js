import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'geeklab.sgomez.dev') {
      return 'https://geeklab-back.sgomez.dev';
    }
    if (hostname === '15.15.15.7') {
      return 'http://15.15.15.7:32131';
    }
  }
  return 'http://15.15.15.7:32131';
};

const SOCKET_URL = getSocketUrl();

// Singleton instance
let socketInstance = null;

export const getSocket = () => {
    if (!socketInstance) {
        socketInstance = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            timeout: 20000,
            autoConnect: true
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }
    return socketInstance;
};

// Legacy export for backwards compatibility
export const createSocket = getSocket;

export default getSocket;

