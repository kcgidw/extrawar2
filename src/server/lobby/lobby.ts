import * as idUtil from './id-util';
import { LobbyUser } from './user';
import { LobbyRoom } from './room';
import {Socket} from 'socket.io';
import { IErrorMessage } from '../../common/messages';

const MAX_ROOMS = 10;

export class Lobby {
	private rooms: Map<string, LobbyRoom> = new Map<string, LobbyRoom>(); // key = roomid
	private users: Map<string, LobbyUser> = new Map<string, LobbyUser>(); // key = userid

	createUser(socket: Socket, username: string): LobbyUser|IErrorMessage {
		var user: LobbyUser;
		var id: string;

		if(this.validateUsername(username) === true) {
			do {
				id = idUtil.makeId();
			} while (this.getUser(id) !== undefined);

			user = new LobbyUser(socket, id, username);
			this.users.set(user.id, user);
			console.log('user created: ' + username);
		} else {
			return {error: 'Invalid username for new user: ' + username};
		}
		return user;
	}

	validateUsername(str: string): boolean {
		// alphanumeric, 4-8 chars
		var regex = /^[a-zA-Z0-9]{4,8}$/;
		return regex.test(str);
	}

	// removeUser(socket: Socket) {
	// 	var user: LobbyUser = socket['user'];
	// 	var room: LobbyRoom = user.room;
	// }

	createRoom(user: LobbyUser): LobbyRoom|IErrorMessage {
		var id: string;
		if(this.rooms.size > MAX_ROOMS) {
			return {error: 'Max room limit reached'};
		}

		do {
			id = idUtil.makeId();
		} while (this.getRoom(id) !== undefined);

		var room: LobbyRoom = new LobbyRoom(id);
		this.rooms.set(room.id, room);
		return room;
	}

	getNumUsersOnline(): number {
		return this.users.size;
	}
	getRoom(id: string) {
		return this.rooms[id];
	}
	getUser(id: string) {
		return this.users[id];
	}
	getUserByUsername(username: string) {
		return undefined; // TODO
	}
	getUserBySocket(socket: SocketIO.Socket) {
		return undefined; // TODO
	}
}
