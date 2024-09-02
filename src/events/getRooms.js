import { rooms } from './../store/index';

export default function(socket, data, callback) {

    socket.emit('getRooms', {
        rooms : rooms.toArray()
    });
};