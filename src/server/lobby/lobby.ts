import { Server, Socket } from 'socket.io';
import { IErrorMessage } from '../../common/messages';
import * as idUtil from './id-util';
import { User } from './user';

const MAX_ROOMS = 10;
const LOBBY_NAMESPACE = 'LOBBY';

export class Lobby {
	io: Server;
	rooms: Set<string> = new Set<string>(); // names of all namespaces within the lobby

	constructor(io: Server) {
		this.io = io;
	}

	createUser(socket: Socket, username: string): User|IErrorMessage {
		var id: string;
		var user = <User>socket;

		if(validateUsername(username)) {
			user.username = username;
			console.log('user created: ' + username);

			socket.join(LOBBY_NAMESPACE);

			return user;
		} else {
			return {error: 'Invalid username for new user: ' + username};
		}
	}

	createRoom(socket: Socket): string|IErrorMessage {
		if(this.rooms.size > MAX_ROOMS) {
			return {error: 'Max room limit reached'};
		}

		var roomId: string;
		do {
			roomId = idUtil.makeId();
		} while (this.rooms.has(roomId));

		return roomId;
	}

	getNumUsersOnline(): number {
		var lob = this.io.sockets.adapter.rooms[LOBBY_NAMESPACE];
		return lob ? lob.length : 0;
	}
}

function validateUsername(str: string): boolean {
	// alphanumeric, 4-8 chars
	var regex = /^[a-zA-Z0-9]{4,8}$/;
	return regex.test(str);
}
