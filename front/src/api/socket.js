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
console.log('[Socket] Connecting to:', SOCKET_URL);

// Singleton instance
let socketInstance = null;

export const getSocket = () => {
    if (!socketInstance) {
        console.log('[Socket] Creating new socket instance...');
        socketInstance = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            timeout: 20000,
            autoConnect: true,
            withCredentials: true
        });

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected:', socketInstance.id);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
        });

        socketInstance.on('reconnect_attempt', (attemptNumber) => {
            console.log('[Socket] Reconnection attempt:', attemptNumber);
        });

        socketInstance.on('reconnect_failed', () => {
            console.error('[Socket] Reconnection failed');
        });
    }
    return socketInstance;
};

// Legacy export for backwards compatibility
export const createSocket = getSocket;

export default getSocket;

