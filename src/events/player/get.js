import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { playerId, roomId } = data;

    const room = rooms.get(roomId);

    if (!room) {
        return socket.emit('getPlayer', {
            error : new RoomNotExistError
        });
    }

    const player = room.getPlayerById(playerId);

    if (!player) {
        return socket.emit('getPlayer', {
            error : new UserNotExistError
        });
    }

    const response = { player };

    socket.emit('getPlayer', response);
    callback(response);
};