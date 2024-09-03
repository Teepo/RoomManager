import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { roomName } = data;

    if (!rooms.has(roomName)) {

        const room = new Room(data);

        rooms.set(room.id, room)

        console.log(`room ${roomName} created`);

        socket.emit('createdRoom', {
            room : room
        });

        callback({ room });
    }
    else {

        socket.send(JSON.stringify({
            type: 'roomError',
            message: `room ${roomName} already exist`
        }));

        socket.emit('createdRoom', {
            error : new UserAlreadyExistError
        });

        callback({
            error : new UserAlreadyExistError
        });
    }
};