import {Socket} from 'socket.io';
import { LobbyRoom } from "./room";

// interface User extends Socket {
// 	username: string;
// }

export class LobbyUser {
	name: string;
	id: string;
	room: LobbyRoom;
	socket: Socket;

	constructor(socket: Socket, id: string, name: string) {
		this.id = id;
		this.name = name;
		this.socket = socket;

		socket['user'] = this;
	}

	setRoom(rm: LobbyRoom) {
		if(rm) {
			this.room = rm;
			this.socket.join(rm.id);
		}
	}
}
