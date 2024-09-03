import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { roomId, id, login } = data;

    const room = rooms.get(roomId);

    if (!room) {
        return socket.emit('joinedRoom', {
            error : new RoomNotExistError
        });
    }

    const player = new Player({
        id     : id ? id : uuidv4(),
        login  : login,
        roomId : roomId,
    });

    try {

        room.addPlayer(player);

        console.log(`player ${login} join room ${roomName}`);

        socket.broadcast.emit('joinedRoom', {
            socketId : socket.id,
            player   : player
        });

        socket.emit('joinedRoom', {
            socketId : socket.id,
            player   : player
        });

        callback({
            socketId : socket.id,
            player  : player
        });
    }
    catch(e) {

        if (e instanceof UserAlreadyExistError) {

            socket.emit('joinedRoom', {
                error : new UserAlreadyExistError
            });
        }
    }
};