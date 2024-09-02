import { rooms } from './../store/index';

export default function(socket, data, callback) {

    const { roomName } = data;

    const room = rooms.get(roomName);

    if (!room) {
        return socket.emit('start', {
            error : new RoomNotExistError
        });
    }

    room.isStarted = true;

    const response = { room };

    socket.emit('start', response);
    socket.broadcast.emit('start', response);

    callback(response);
};