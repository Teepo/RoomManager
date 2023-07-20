import { UserAlreadyExistError } from './errors/index.js';

export class Room {

    #players;

    constructor(name) {
        this.name      = name;
        this.isStarted = false;
        this.#players  = new Map;
    }

    addPlayer(player) {

        if (this.#players.toArray().find(p => p.login === player.login)) {
            throw new UserAlreadyExistError;
        }

        this.#players.set(player.id, player);
    }

    getPlayers() {
        return this.#players;
    }

    getPlayerById(id) {
        return this.#players.get(id);
    }

    deletePlayers() {
        this.#players.clear()
    }
}