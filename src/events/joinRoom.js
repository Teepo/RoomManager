import { rooms } from './../store/index';

export default function(socket, data, callback) {

    const { roomName, id, login } = data;

    const room = rooms.get(roomName);

    if (!room) {
        return socket.emit('joinedRoom', {
            error : new RoomNotExistError
        });
    }

    const player = new Player({
        id       : id ? id : uuidv4(),
        login    : login,
        roomName : roomName,
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
            player : player
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