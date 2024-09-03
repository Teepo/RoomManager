import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { roomId } = data;

    const room = rooms.get(roomId);

    if (!room) {
        return callback({
            error : new RoomNotExistError
        });
    }

    callback({ room });
};