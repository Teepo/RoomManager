export class Player {

    constructor({ id, login, roomName }) {
        
        this.id         = id;
        this.login      = login;
        this.isReady    = false;
        this.roomName   = roomName;
        this.customData = {};
    }
}