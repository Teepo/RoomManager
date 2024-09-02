const eventHandlers = {
    
    start: (socket, data, callback) => import('./start.js').then(module => module.default(socket, data, callback)),
    stop: (socket, data, callback) => import('./stop.js').then(module => module.default(socket, data, callback)),
    data: (socket, data, callback) => import('./data.js').then(module => module.default(socket, data, callback)),
    close: (socket, data, callback) => import('./close.js').then(module => module.default(socket, data, callback)),
   
    joinRoom: (socket, data, callback) => import('./joinRoom.js').then(module => module.default(socket, data, callback)),
    leaveRoom: (socket, data, callback) => import('./leaveRoom.js').then(module => module.default(socket, data, callback)),
    joinRoom: (socket, data, callback) => import('./joinRoom.js').then(module => module.default(socket, data, callback)),
    createRoom: (socket, data, callback) => import('./createRoom.js').then(module => module.default(socket, data, callback)),
    getRooms: (socket, data, callback) => import('./getRooms.js').then(module => module.default(socket, data, callback)),
    deleteRoom: (socket, data, callback) => import('./deleteRoom.js').then(module => module.default(socket, data, callback)),
    
    getPlayer: (socket, data, callback) => import('./getPlayer.js').then(module => module.default(socket, data, callback)),
    getAllPlayers: (socket, data, callback) => import('./getAllPlayers.js').then(module => module.default(socket, data, callback)),
    getAllPlayersFromRoom: (socket, data, callback) => import('./getAllPlayersFromRoom.js').then(module => module.default(socket, data, callback)),
    setPlayerIsReady: (socket, data, callback) => import('./setPlayerIsReady.js').then(module => module.default(socket, data, callback)),
    updatePlayer: (socket, data, callback) => import('./updatePlayer.js').then(module => module.default(socket, data, callback)),
    deletePlayer: (socket, data, callback) => import('./deletePlayer.js').then(module => module.default(socket, data, callback)),
};

export default eventHandlers;