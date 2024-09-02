import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { player, roomId, value } = data;

    const room = rooms.get(roomId);

    if (!room) {
        return socket.emit('setPlayerIsReady', {
            error : new RoomNotExistError
        });
    }

    const p = room.getPlayerById(player.id);

    try {
        p.isReady = value ?? !p.isReady;
    }
    catch(e) {
        console.error('Try to update ready status', p);
    }

    socket.emit('setPlayerIsReady', {
        player : p
    });

    socket.broadcast.emit('setPlayerIsReady', {
        player : p
    });
};