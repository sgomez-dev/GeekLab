let _io = null;

export const setupForum = (io) => {
    _io = io;
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('forumMessage', (msg) => {
            io.emit('forumMessage', msg);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

export const getIO = () => _io;