import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { id, roomId } = data;

    const room = rooms.get(roomId);

    if (!room) {
        return socket.emit('getPlayer', {
            error : new RoomNotExistError
        });
    }

    const player = room.getPlayerById(id);

    if (!player) {
        return socket.emit('getPlayer', {
            error : new UserNotExistError
        });
    }

    socket.emit('getPlayer', {
        player : player
    });
};