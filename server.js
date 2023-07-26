import { createServer } from 'https';
import { readFileSync } from 'fs';
import { Server } from 'socket.io';

import { v4 as uuidv4 } from 'uuid';

import { Room } from './src/room.js';
import { Player } from './src/player.js';

import {
    RoomNotExistError,
    UserAlreadyExistError,
    UserNotExistError
} from './src/errors/index.js';

Map.prototype.toArray = function() {
    return Array.from(this.values());
};

export default class GameServer {

    #rooms = new Map;

    constructor() {

        const server = createServer({
            cert : readFileSync('./certs/cert.pem'),
            key  : readFileSync('./certs/key.pem')
        });

        server.listen(3000);

        this.ws = new Server(server, {
            cors: {
                origin: '*',
                credentials: true
            }
        });

        this.rooms = new Map();

        // Gérer les connexions des joueurs
        this.ws.on('connection', socket => {

            socket.on('start', data => {
                this.handleStart(socket, data);
            });

            socket.on('joinRoom', data => {
                this.handleJoinRoom(socket, data);
            });

            socket.on('leaveRoom', data => {
                this.handleLeaveRoom(socket, data);
            });

            socket.on('createRoom', data => {
                this.handleCreateRoom(socket, data);
            });

            socket.on('getRooms', () => {
                this.handleGetRooms(socket);
            });

            socket.on('getPlayer', data => {
                this.handleGetPlayer(socket, data);
            });

            socket.on('getAllPlayers', () => {
                this.handleGetAllPlayers(socket);
            });

            socket.on('getAllPlayersFromRoom', data => {
                this.handleGetAllPlayersFromRoom(socket, data);
            });

            socket.on('setPlayerIsReady', data => {
                this.handleSetPlayerIsReady(socket, data);
            });

            socket.on('addPlayerCustomData', data => {
                this.handleAddPlayerCustomData(socket, data);
            });

            socket.on('deletePlayer', data => {
                this.handleDeletePlayer(socket, data);
            });

            socket.on('deleteAllPlayers', () => {
                this.handleDeleteAllPlayers(socket);
            });

            socket.on('close', () => {
                this.handleClose(socket);
            });
        });
    }

    handleStart(socket, data) {

        const { roomName } = data;

        const room = this.#rooms.get(roomName);

        if (room) {

            room.isStarted = true;

            socket.emit('start', { room : room });
            socket.broadcast.emit('start', { room : room });
        }
        else {

            socket.emit('joinedRoom', {
                error : new RoomNotExistError
            });
        }
    }

    handleJoinRoom(socket, data) {

        const { roomName, login } = data;

        const room = this.#rooms.get(roomName);

        if (room) {

            const player = new Player({
                id    : uuidv4(),
                login : login
            });

            try {

                room.addPlayer(player);

                console.log(`player ${login} join room ${roomName}`);

                socket.broadcast.emit('joinedRoom', {
                    socketId : socket.id,
                    player   : player
                });

                socket.emit('joinedRoom', {
                    socketId : socket.id,
                    player : player
                });
            }
            catch(e) {

                if (e instanceof UserAlreadyExistError) {

                    socket.emit('joinedRoom', {
                        error : new UserAlreadyExistError
                    });
                }
            }
        }
        else {

            socket.emit('joinedRoom', {
                error : new RoomNotExistError
            });
        }
    }

    handleLeaveRoom(socket, data) {

        const { id, roomName } = data;

        const room = this.#rooms.get(roomName);

        if (!room) {
            return socket.emit('getPlayer', {
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
    }

    handleCreateRoom(socket, data) {

        const { roomName } = data;

        if (!this.#rooms.has(roomName)) {

            const room = new Room(roomName);

            this.#rooms.set(roomName, room)

            console.log(`room ${roomName} created`);

            socket.emit('createdRoom', {
                room : room
            });
        }
        else {

            socket.send(JSON.stringify({
                type: 'roomError',
                message: `room ${roomName} already exist`
            }));
        }
    }

    handleGetRooms(socket) {

        socket.emit('getRooms', {
            rooms : this.#rooms.toArray()
        });
    }

    handleGetAllPlayers(socket) {

        const rooms = Array.from(this.#rooms.values());

        const players = rooms.map(room => {
            return room.getPlayers().toArray();
        });

        socket.emit('getAllPlayers', {
            players : players.flat()
        });
    }

    handleGetAllPlayersFromRoom(socket, data) {

        const { roomName } = data;

        const room = this.#rooms.get(roomName);

        if (!room) {
            return socket.emit('getPlayer', {
                error : new RoomNotExistError
            });
        }

        socket.emit('getAllPlayersFromRoom', {
            players : room.getPlayers().toArray()
        });
    }

    handleSetPlayerIsReady(socket, data) {

        const { player, roomName, value } = data;

        const room = this.#rooms.get(roomName);

        if (!room) {
            return socket.emit('getPlayer', {
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
    }

    handleGetPlayer(socket, data) {

        const { id, roomName } = data;

        const room = this.#rooms.get(roomName);

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
    }

    handleAddPlayerCustomData(socket, data) {

        const { player, roomName, customData } = data;

        const room = this.#rooms.get(roomName);

        if (!room) {
            return socket.emit('getPlayer', {
                error : new RoomNotExistError
            });
        }

        const p = room.getPlayerById(player.id);

        if (!p) {
            return socket.emit('updatePlayer', {
                error : new UserNotExistError
            });
        }

        p.customData = customData;

        socket.emit('addedPlayerCustomData', {
            player : p
        });
        socket.broadcast.emit('addedPlayerCustomData', {
            player : p
        });
    }

    handleDeletePlayer(socket, data) {

        const { id } = data;

        const rooms = this.#rooms.toArray();

        rooms.map(room => {
            room.deletePlayer(id);
        });

        console.log(`player ${id} deleted from all rooms`);

        socket.broadcast.emit('deletedPlayer', {
            id : id
        });
        socket.emit('deletedPlayer', {
            id : id
        });
    }

    handleDeleteAllPlayers(socket) {

        const rooms = this.#rooms.toArray();

        rooms.map(room => {
            room.deletePlayers();
        });

        socket.broadcast.emit('deletedAllPlayers');
        socket.emit('deletedAllPlayers');
    }

    handleClose(socket) {

        const roomName = socket.room;

        console.log('client disconnect');

        const room = this.rooms.get(roomName);

        if (!room) {
            return socket.emit('getPlayer', {
                error : new RoomNotExistError
            });
        }

        room.delete(socket);

        socket.broadcast('playerLeft');

        // Supprimer la salle si elle est vide
        if (room.size === 0) {
            this.rooms.delete(roomName);
            console.log(`room ${roomName} removed because empty`);
        }
    }
}