let _io = null;
let connectedClients = 0;

export const setupForum = (io) => {
    _io = io;
    console.log('[Socket.IO] Forum setup initialized');
    
    io.on('connection', (socket) => {
        connectedClients++;
        console.log(`[Socket.IO] Client connected: ${socket.id} (Total: ${connectedClients})`);
        console.log(`[Socket.IO] Client handshake:`, socket.handshake.headers.origin);

        socket.on('forumMessage', (msg) => {
            console.log('[Socket.IO] Received forumMessage event (deprecated):', msg);
            io.emit('forumMessage', msg);
        });

        socket.on('disconnect', (reason) => {
            connectedClients--;
            console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason}, Total: ${connectedClients})`);
        });

        socket.on('error', (error) => {
            console.error(`[Socket.IO] Socket error for ${socket.id}:`, error);
        });
    });
    
    io.engine.on('connection_error', (err) => {
        console.error('[Socket.IO] Connection error:', err);
    });
};

export const getIO = () => {
    if (!_io) {
        console.error('[Socket.IO] IO instance not initialized!');
    }
    return _io;
};