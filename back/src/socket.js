let _io = null;

export const setupChat = (io) => {
    _io = io;
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('chatMessage', (msg) => {
            io.emit('chatMessage', msg);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

export const getIO = () => _io;