import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { roomId } = data;

    const room = rooms.get(roomId);

    if (!room) {
        return socket.emit('player/getAllFromRoom', {
            error : new RoomNotExistError
        });
    }

    const response = {
        players : room.getPlayers().toArray()
    };

    socket.emit('player/getAllFromRoom', response);

    callback(response);
};