import { createServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';

import { Room } from './src/room.js';
import { Player } from './src/player.js';

export default class GameServer {

    #rooms = new Map;

    constructor() {

        const server = createServer({
            cert : readFileSync('./certs/cert.pem'),
            key  : readFileSync('./certs/key.pem')
        });

        server.listen(3000);

        this.wss = new WebSocketServer({ server });

        this.rooms = new Map();

        // Gérer les connexions des joueurs
        this.wss.on('connection', socket => {

            console.log('client connect');

            socket.on('message', message => {
                this.handleMessage(socket, message);
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

            room.addPlayer(new Player({
                login  : login,
                socket : socket
            }));

            console.log(`player ${login} join room ${roomName}`);

            // Envoyer une notification aux autres joueurs de la salle
            this.broadcastToOthersInRoom(roomName, {
                type: 'playerJoined',
                message: `player ${login} join room ${roomName}`
            }, socket);
        }
        else {

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

            socket.send(JSON.stringify({
                type: 'createRoom',
                data: { room }
            }));
        }
        else {

            socket.send(JSON.stringify({
                type: 'roomError',
                message: `room ${roomName} already exist`
            }));
        }
    }

    handleGetRooms(socket) {

        socket.send(JSON.stringify({
            type: 'getRooms',
            data: this.#rooms
        }));
    }

    handlePlayerMove(socket, data) {

        const { roomName } = data;

        if (roomName) {

            this.broadcastToOthersInRoom(roomName, {
                type: 'playerMoved',
                movement
            }, socket);
        }
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

    handleMessage(socket, message) {

        const { type, data } = JSON.parse(message);

        switch (type) {
            case 'createRoom':
                this.handleCreateRoom(socket, data);
            break;
            case 'joinRoom':
                this.handleJoinRoom(socket, data);
            break;
            case 'playerMove':
                this.handlePlayerMove(socket, data);
            break;
            case 'getPlayersRoom':
                this.handleGetPlayersRoom(socket, data);
            break;
            case 'getRooms':
                this.handleGetRooms(socket);
            break;
            default:
                socket.send(JSON.stringify({
                    type: 'error',
                    message: `this method is not handled ${type}`
                }));
            break;
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