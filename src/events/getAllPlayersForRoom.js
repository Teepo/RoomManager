import { rooms } from './../store/index';

export default function(socket, data, callback) {

    const { roomId } = data;

    const room = rooms.get(roomId);

    if (!room) {
        return socket.emit('getAllPlayersForRoom', {
            error : new RoomNotExistError
        });
    }

    socket.emit('getAllPlayersForRoom', {
        players : room.getPlayers().toArray()
    });
};