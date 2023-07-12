import { UserAlreadyExistError } from './errors/index.js';
import { UserNotExistError     } from './errors/index.js';

export class Room {

    #players;

    constructor(name) {
        this.name = name;
        this.#players = [];
    }

    addPlayer(player) {

        if (this.#players.find(p => p.login === player.login)) {
            throw new UserAlreadyExistError;
        }

        this.#players.push(player);
    }

    getPlayers() {
        return this.#players;
    }

    getPlayerBySocketId(socketId) {

        let player;
        if (!(player = this.#players.find(p => p.socketId === socketId))) {
            throw new UserNotExistError;
        }

        return player;
    }
}