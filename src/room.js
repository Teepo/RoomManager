import { UserAlreadyExistError } from './errors/index.js';
import { UserNotExistError     } from './errors/index.js';

export class Room {

    #players;

    constructor(name) {
        this.name = name;
        this.#players = new Map;
    }

    addPlayer(player) {

        if (this.#players.has(player.id)) {
            throw new UserAlreadyExistError;
        }

        this.#players.set(player.id, player);
    }

    getPlayers() {
        return this.#players;
    }

    getPlayerBySocketId(socketId) {

        if (this.#players.has(socketId)) {
            throw new UserAlreadyExistError;
        }

        this.#players.get(player.id);
    }

    deletePlayers() {
        this.#players.clear()
    }
}