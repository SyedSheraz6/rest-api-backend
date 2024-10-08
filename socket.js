const { Server } = require('socket.io');
let io;

exports.init = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET,POST']
        }
    });
    return io;
}

exports.getIo = () => {
    if(!io) {
        throw new Error('Socketio connection not established!')
    }
    return io;
}