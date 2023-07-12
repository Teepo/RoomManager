export class Player {

    constructor({ login, socket }) {
        
        this.login = login;
        this.socket = socket;
        this.isReady = false;
    }
}