import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export const createSocket = () => {
    return io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000
    });
};

export default createSocket;

