import { rooms } from '../../store/index';

export default function(socket, data, callback) {

    rooms.toArray().map(room => {
        room.deletePlayers();
    });

    socket.broadcast.emit('deletedAllPlayers');
    socket.emit('deletedAllPlayers');
};