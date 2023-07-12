<template>

	<v-container class="fill-height">
		<v-responsive class="d-flex align-center fill-height">

			<v-container>
				<v-btn class="bg-primary" @click="createRoom">CREATE ROOM</v-btn>
				<v-btn class="bg-primary" @click="start">START GAME</v-btn>
				<v-btn class="bg-primary ml-5" @click="reset">RESET GAME</v-btn>
				<v-btn class="bg-primary ml-5" @click="return_to_lobby">RETURN TO LOBBY</v-btn>
			</v-container>

			<v-container>
				<v-btn class="bg-primary" @click="cleanPlayers">CLEAN PLAYERS</v-btn>
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



export default {

	data() {

		return {
			players : [],
			rooms   : []
		}
	},
    
    async mounted() {
        
        this.socket = new WebSocket(`wss://92.222.23.73:3000`);

        this.socket.addEventListener('open', () => {
            this.socket.send(JSON.stringify({ type: 'getRooms' }));
        });

        this.socket.addEventListener('message', event => {
            
            const { type, data } = JSON.parse(event.data);

            switch (type) {
                case 'getRooms':
                    this.handleGetRooms(data);
                break;
				case 'createRoom':
                    this.handleCreateRoom(data);
                break;
                default:
                    console.error(`this method is not handled ${type}`, event);
                break;
            }
        });
    },
    methods : {

		createRoom() {
			
			this.socket.send(JSON.stringify({ type: 'createRoom', data : {
                roomName : 'petank'
            }}));
		},

        handleGetRooms(data) {
            console.log('handleGetRooms', data)
        },

		handleCreateRoom(data) {

			const { room } = data;

			this.rooms.push(room);

            console.log('handleGetRooms', data)
        },
    }
}
</script>