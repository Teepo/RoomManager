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

        const response = {
            socketId : socket.id,
            player   : player
        };

        socket.broadcast.emit('room/join', response);
        socket.emit('room/join', response);
        callback(response);
    }
    catch(e) {

        if (e instanceof UserAlreadyExistError) {

            const response = {
                error : new UserAlreadyExistError
            };
            
            socket.emit('room/join', response);
            callback(response);
        }
    }
};