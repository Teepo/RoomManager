export class Player {

    constructor({ id, login, roomId }) {
        
        this.id         = id;
        this.login      = login;
        this.isReady    = false;
        this.roomId     = roomId;
        this.customData = {};
    }
}