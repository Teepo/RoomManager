import { v4 as uuidv4 } from 'uuid';

import { rooms } from '../../store/index.js';

import { RoomNotExistError, UserAlreadyExistError } from './../../errors/index.js';

import { Player } from './../../player.js';

export default function(socket, data, callback) {

    const { roomId, id, login } = data;

    const room = rooms.get(roomId);

    if (!room) {

        const response = {
            error : new RoomNotExistError
        };

        socket.emit('room/join', response);
        callback(response);
        return;
    }

    const player = new Player({
        id     : id ? id : uuidv4(),
        login  : login,
        roomId : roomId,
    });

    try {

        room.addPlayer(player);

        console.log(`player ${login} join room ${room.name}`);

        const response = {
            socketId : socket.id,
            player   : player
        };

        socket.broadcast.emit('room/join', response);
        socket.emit('room/join', response);
        callback(response);
    }
    catch(e) {

        if (e instanceof UserAlreadyExistError) {

            const response = {
                error : new UserAlreadyExistError
            };
            
            socket.emit('room/join', response);
            callback(response);
        }
    }
};