import { createServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';

export default class GameServer {

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

        const { roomName } = data;

        const room = this.rooms.get(roomName);

        if (room) {

            socket.room = roomName;

            room.add(socket);

            console.log(`player join room ${roomName}`);

            // Envoyer une notification aux autres joueurs de la salle
            this.sendToRoom(roomName, {
                type: 'playerJoined',
                message: `player join room ${roomName}`
            }, socket);
        } else {

            socket.send(JSON.stringify({
                type: 'roomError',
                message: `room ${roomName} doesnt exist`
            }));
        }
    }

    handleCreateRoom(socket, data) {

        const { roomName } = data;

        if (!this.rooms.has(roomName)) {

            socket.room = roomName;

            this.rooms.set(roomName, new Set([socket]));

            console.log(`room ${roomName} created`);
        }
        else {

            socket.send(JSON.stringify({
                type: 'roomError',
                message: `room ${roomName} already exist`
            }));
        }
    }

    handlePlayerMove(socket, data) {

        const { roomName } = data;

        if (roomName) {

            this.sendToRoom(roomName, {
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
            this.sendToRoom(roomName, {
                type: 'playerLeft',
                message: `player left room ${roomName}`
            }, socket);

            // Supprimer la salle si elle est vide
            if (room.size === 0) {
                this.rooms.delete(roomName);
                console.log(`room ${roomName} removed because empty`);
            }
        }
    }

    handleMessage(socket, message) {

        const { type, data } = JSON.parse(message);

        switch (type) {
            case 'createPlayer':
                this.handleCreatePlayer(socket, data);
            break;
            case 'createRoom':
                this.handleCreateRoom(socket, data);
            break;
            case 'joinRoom':
                this.handleJoinRoom(socket, data);
            break;
            case 'playerMove':
                this.handlePlayerMove(socket, data);
            break;
            default:
                socket.send(JSON.stringify({
                    type: 'error',
                    message: 'this method is not handled'
                }));
            break;
        }
    }

    sendToRoom(roomName, message, sender) {
        const room = this.rooms.get(roomName);
        for (const socket of room) {
            if (socket !== sender) {
                socket.send(JSON.stringify(message));
            }
        }
    }
}