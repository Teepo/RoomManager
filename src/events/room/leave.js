import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    const { id, roomName } = data;

    const room = rooms.get(roomName);

    if (!room) {
        return socket.emit('leavedRoom', {
            error : new RoomNotExistError
        });
    }

    room.deletePlayer(id);

    console.log(`player ${id} leave room ${roomName}`);

    socket.broadcast.emit('leavedRoom', {
        id : id
    });
    socket.emit('leavedRoom', {
        id : id
    });
};