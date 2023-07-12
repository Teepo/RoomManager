import { createServer } from 'https';
import { readFileSync } from 'fs';
import { Server } from 'socket.io';

import { v4 as uuidv4 } from 'uuid';

import { Room } from './src/room.js';
import { Player } from './src/player.js';

import {
    RoomNotExistError,
    UserAlreadyExistError
} from './src/errors/index.js';

Map.prototype.toArray = function() {
    return Array.from(this.values())
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

            socket.on('joinRoom', data => {
                this.handleJoinRoom(socket, data);
            });

            socket.on('getPlayersRoom', data => {
                this.handleGetPlayersRoom(socket, data);
            });

            socket.on('createRoom', data => {
                this.handleCreateRoom(socket, data);
            });

            socket.on('getRooms', () => {
                this.handleGetRooms(socket);
            });

            socket.on('getAllPlayers', () => {
                this.handleGetAllPlayers(socket);
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
                    player : player
                });

                socket.emit('joinedRoom', {
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

    handleGetPlayersRoom(socket, data) {

        const { roomName } = data;

        const room = this.#rooms.get(roomName);

        if (room) {
            socket.send(JSON.stringify(room.getPlayers()));
        }
        else {

            socket.send(JSON.stringify({
                type: 'roomError',
                message: `room ${roomName} doesnt exist`
            }));
        }
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

    handleDeletePlayer(socket, data) {

        const { id } = data;

        const rooms = this.#rooms.toArray();

        rooms.map(room => {
            room.getPlayers().delete(id);
        });

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

        if (roomName) {

            const room = this.rooms.get(roomName);

            room.delete(socket);

            socket.broadcast('playerLeft');

            // Supprimer la salle si elle est vide
            if (room.size === 0) {
                // this.rooms.delete(roomName);
                // console.log(`room ${roomName} removed because empty`);
            }
        }
    }
}