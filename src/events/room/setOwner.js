import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { roomId, playerId } = data;

    const room = rooms.get(roomId);

    if (!room) {
        return callback({
            error : new RoomNotExistError
        });
    }

    const player = room.getPlayerById(playerId);

    if (!player) {
        return callback({
            error : new UserNotExistError
        });
    }

    room.setOwner(player);
};