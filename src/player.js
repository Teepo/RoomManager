export class Player {

    constructor({ id, login }) {
        
        this.id         = id;
        this.login      = login;
        this.isReady    = false;
        this.customData = {};
    }
}