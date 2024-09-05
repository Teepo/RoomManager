import { rooms } from '../../store/index.js';

import { RoomAlreadyExistError } from './../../errors/index.js';

export default function(socket, data, callback) {

    const { roomId } = data;

    const room = rooms.get(roomId);

    if (!room) {
        return callback({
            error : new RoomNotExistError
        });
    }

    socket.emit('room/get', { room });

    callback({ room });
};