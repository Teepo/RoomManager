import { v4 as uuidv4 } from 'uuid';

import { UserAlreadyExistError } from './errors/index.js';

export class Room {

    #players;

    constructor({ name, settings }) {
	this.id        = uuidv4();
        this.name      = name;
        this.isStarted = false;
        this.#players  = new Map;

	this.settings  = settings;
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

    updatePlayer(id, player) {
        this.#players.set(id, player);
    }

    deletePlayer(id) {
        this.#players.delete(id);
    }

    deletePlayers() {
        this.#players.clear()
    }

    getSettings() {
	return this.settings;
    }
}
