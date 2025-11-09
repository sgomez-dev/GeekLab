let _io = null;
let connectedClients = 0;

export const setupForum = (io) => {
    _io = io;
    io.on('connection', (socket) => {
        connectedClients++;
        console.log(`Client connected: ${socket.id} (Total: ${connectedClients})`);

        socket.on('forumMessage', (msg) => {
            io.emit('forumMessage', msg);
        });

        socket.on('disconnect', (reason) => {
            connectedClients--;
            console.log(`Client disconnected: ${socket.id} (Reason: ${reason}, Total: ${connectedClients})`);
        });

        socket.on('error', (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });
    });
};

export const getIO = () => _io;