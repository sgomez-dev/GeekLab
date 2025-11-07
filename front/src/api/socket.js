import { io } from 'socket.io-client';

const SOCKET_URL = 'http://15.15.15.7:32131';

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

