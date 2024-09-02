import yargs from 'yargs';

import { createServer } from 'https';
import { readFileSync } from 'fs';
import { Server } from 'socket.io';

import defaultHandler from './src/events/default.js';
import eventHandlers  from './src/events/index.js';

Map.prototype.toArray = function() {
    return Array.from(this.values());
};

const PORT = 3000;

export default class GameServer {

    constructor() {

        const argv = yargs(process.argv).argv;

        const isHTTPS = argv.https ?? false;

        if (isHTTPS) {

            const server = createServer({
                cert : readFileSync('./certs/cert.pem'),
                key  : readFileSync('./certs/key.pem')
            });

            server.listen(PORT);

            this.ws = new Server(server, {
                cors: {
                    origin: '*',
                    credentials: true
                }
            });
        }
        else {
            this.ws = new Server(PORT, {
                cors: {
                    origin: '*',
                    credentials: true
                }
            });
        }

        this.ws.on('connection', socket => {

            socket.onAny((eventName, data, callback) => {

                if (eventHandlers[eventName]) {
                    eventHandlers[eventName](socket, data, callback);
                }
                else {
                    defaultHandler(socket, data, callback);
                }
            });
        });
    }
}
