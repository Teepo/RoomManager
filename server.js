import { createServer } from 'https';
import { readFileSync } from 'fs';
import { Server } from 'socket.io';

import { v4 as uuidv4 } from 'uuid';

import { Room } from './src/room.js';
import { Player } from './src/player.js';

import { UserAlreadyExistError } from './src/errors/index.js';

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
                id     : uuidv4(),
                login  : login,
                socket : socket,
            });

            try {

                room.addPlayer(player);

                console.log(`player ${login} join room ${roomName}`);

                // Envoyer une notification aux autres joueurs de la salle
                this.broadcastToOthersInRoom(roomName, {
                    type: 'playerJoined',
                    message: `player ${login} join room ${roomName}`
                }, socket);

                socket.emit('joinedRoom', {
                    id : player.id
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
                id : player.id
            });

            socket.send(JSON.stringify({
                type: 'roomError',
                message: `room ${roomName} doesnt exist`
            }));
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
            rooms : Array.from(this.#rooms.values())
        });
    }

    handleClose(socket) {

        const roomName = socket.room;

        console.log('client disconnect');

        if (roomName) {

            const room = this.rooms.get(roomName);

            room.delete(socket);

            // Envoyer une notification aux autres joueurs de la salle
            this.broadcastToOthersInRoom(roomName, {
                type: 'playerLeft',
                message: `player left room ${roomName}`
            }, socket);

            // Supprimer la salle si elle est vide
            if (room.size === 0) {
                // this.rooms.delete(roomName);
                // console.log(`room ${roomName} removed because empty`);
            }
        }
    }

    broadcastToOthersInRoom(roomName, message, sender) {
        const room = this.#rooms.get(roomName);
        for (const player of room.getPlayers()) {
            if (player.socket !== sender) {
                player.socket.send(JSON.stringify(message));
            }
        }
    }

    broadcastToRoom(roomName, message) {
        const room = this.#rooms.get(roomName);
        for (const player of room.getPlayers()) {
            player.socket.send(JSON.stringify(message));
        }
    }
}