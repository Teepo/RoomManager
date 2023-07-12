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
					<th class="text-left">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="room in rooms" :key="room.name">
						<td>{{ room.name }}</td>
						<td>
							<v-btn icon="mdi-delete"></v-btn>
						</td>
					</tr>
				</tbody>
			</v-table>

			<v-container>
				<v-btn class="bg-primary" @click="cleanPlayers">CLEAN PLAYERS</v-btn>
			</v-container>
			<div class="text-h6 mb-1">PLAYERS</div>
			<v-table class="text-left">
				<thead>
					<tr>
						<th class="text-left">ID</th>
						<th class="text-left">LOGIN</th>
						<th class="text-left">IS READY</th>
						<th class="text-left">
							Actions
						</th>
						</tr>
					</thead>
				<tbody>
					<tr v-for="player in players" :key="player.id">
						<td class="text-left">{{ player.id }}</td>
						<td>{{ player.login }}</td>
						<td>{{ player.isReady }}</td>
						<td>
							<v-btn icon="mdi-delete" @click="this.delete(player.id)"></v-btn>
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
        });

		this.socket.on('getRooms', data => {

			const { rooms } = data;

			this.handleGetRooms(rooms);
        });

		this.socket.on('createdRoom', data => {
			this.handleCreateRoom(data);
        });
    },
    methods : {

		createRoom() {

			console.log('emit', this.socket)

			this.socket.emit('createRoom', {
                roomName : 'petank'
            });
		},

        handleGetRooms(data) {

			this.rooms = data;
        },

		handleCreateRoom(data) {

			const { room } = data;

			this.rooms.push(room);

            console.log('handleGetRooms', data)
        },
    }
}
</script>