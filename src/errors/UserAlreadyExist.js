export class UserAlreadyExistError extends Error {
    
    constructor(message) {
        
        super(message);
        
        this.name    = "UserAlreadyExistError";
        this.message = 'This name is already used';
        this.state   = 'warning';
    }
}