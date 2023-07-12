export class Player {

    constructor({ id, login, socket }) {
        
        this.id      = id;
        this.login   = login;
        this.socket  = socket;
        this.isReady = false;
    }
}