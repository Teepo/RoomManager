import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { roomName } = data;

    if (!rooms.has(roomName)) {

        const room = new Room(data);

        rooms.set(room.id, room);

        console.log(`room ${roomName} created`);

        socket.emit('createdRoom', { room });

        callback({ room });
    }
    else {

        const response = {
            error : new RoomAlreadyExistError
        };

        socket.send(JSON.stringify(response));
        socket.emit('createdRoom', response);
        callback(response);
    }
};