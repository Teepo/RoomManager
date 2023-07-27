<template>

	<v-container class="fill-height">
		<v-responsive class="d-flex align-center fill-height">

			<v-container>
				<v-btn class="bg-primary" @click="createRoom">CREATE ROOM</v-btn>
				<v-btn class="bg-primary ml-5" @click="start">START GAME</v-btn>
				<v-btn class="bg-primary ml-5" @click="return_to_lobby">RETURN TO LOBBY</v-btn>
			</v-container>

			<div class="text-h6 mb-1">ROOMS</div>
			<v-table class="text-left">
				<thead>
					<tr>
						<th class="text-left">NAME</th>
						<th class="text-left">IS STARTED</th>
						<th class="text-left">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="room in rooms" :key="room.name">
						<td>{{ room.name }}</td>
						<td>{{ room.isStarted }}</td>
						<td>
							<v-btn icon="mdi-delete" @click="this.deleteRoom(room.name)"></v-btn>
						</td>
					</tr>
				</tbody>
			</v-table>

			<v-container>
				<v-btn class="bg-primary" @click="createPlayer">CREATE PLAYER</v-btn>
				<v-btn class="bg-primary ml-5" @click="deleteAllPlayers">CLEAN PLAYERS</v-btn>
			</v-container>
			<div class="text-h6 mb-1">ALL PLAYERS</div>
			<v-table class="text-left">
				<thead>
					<tr>
						<th class="text-left">ID</th>
						<th class="text-left">LOGIN</th>
						<th class="text-left">IS READY</th>
						<th class="text-left">CUSTOM DATA</th>
						<th class="text-left">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="player in players" :key="player.id">
						<td class="text-left">{{ player.id }}</td>
						<td>{{ player.login }}</td>
						<td>{{ player.isReady }}</td>
						<td>{{ player.customData }}</td>
						<td>
							<v-btn icon="mdi-delete" @click="this.deletePlayer(player.id)"></v-btn>
						</td>
					</tr>
				</tbody>
			</v-table>
		</v-responsive>
	</v-container>
</template>

<script>

import { io } from 'socket.io-client';

export default {

	data() {

		return {
			players : [],
			rooms   : []
		}
	},
    
    async mounted() {
        
        this.socket = new io(`wss://92.222.23.73:3000`);

        this.socket.on('connect', () => {
            this.socket.emit('getRooms');
            this.socket.emit('getAllPlayers');
        });

		this.socket.on('start', data => {
			this.handleStart(data);
        });

		this.socket.on('getRooms', data => {
			this.handleGetRooms(data);
        });

		this.socket.on('getAllPlayers', data => {
			this.handleGetAllPlayers(data);
		});

		this.socket.on('createdRoom', data => {
			this.handleCreateRoom(data);
        });

		this.socket.on('joinedRoom', data => {
			this.handleJoinedRoom(data);
        });

		this.socket.on('leavedRoom', data => {
			this.handleLeavedRoom(data);
        });

		this.socket.on('deletedRoom', data => {
			this.handleDeletedRoom(data);
        });

		this.socket.on('deletedPlayer', data => {
			this.handleDeletedPlayer(data);
        });

		this.socket.on('deletedAllPlayers', () => {
			this.handleDeletedAllPlayers();
        });
    },
    methods : {

		start() {

			this.socket.emit('start', {
                roomName : 'petank'
            });
		},

		createRoom() {

			this.socket.emit('createRoom', {
                roomName : 'petank'
            });
		},

		createPlayer() {
			this.socket.emit('joinRoom', {
				login    : this.generateRandomString(10),
                roomName : 'petank'
            });
		},

		deletePlayer(id) {
			this.socket.emit('deletePlayer', { id : id });
		},

		deleteAllPlayers() {
			this.socket.emit('deleteAllPlayers');
		},

		deleteRoom(name) {
			this.socket.emit('deleteRoom', { roomName : name });
		},

		handleStart(data) {

			const { room } = data;

			this.rooms.find(r => r.name == room.name).isStarted = room.isStarted;
        },

        handleGetRooms(data) {
			const { rooms } = data;
			this.rooms = rooms;
        },

		handleGetAllPlayers(data) {
			const { players } = data;
			this.players = players;
		},

		handleCreateRoom(data) {
			const { room } = data;
			this.rooms.push(room);
        },

		handleJoinedRoom(data) {
			const { player } = data;
			this.players.push(player);
        },

		handleLeavedRoom(data) {
			this.handleDeletedPlayer(data);
        },

		handleDeletedPlayer(data) {

			const { id } = data;

			this.players = this.players.filter(p => {
                return p.id !== id;
            }) ?? [];
        },

		handleDeletedRoom(data) {

			const { roomName } = data;

			this.rooms = this.rooms.filter(r => {
				return r.name !== roomName;
			}) ?? [];
		},

		handleDeletedAllPlayers() {
			this.players = [];
        },

		generateRandomString(length) {

			let string = '';
			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

			for (let i = 0; i < length; i++) {
				const randomIndex = Math.floor(Math.random() * chars.length);
				string += chars.charAt(randomIndex);
			}

			return string;
		}
    }
}
</script>