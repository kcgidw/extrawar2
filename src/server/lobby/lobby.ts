import { Server, Socket, Namespace } from 'socket.io';
import { IErrorMessage } from '../../common/messages';
import { GameRoom } from '../game-room/game-room';
import * as idUtil from './id-util';
import { User } from './user';
import { LobbyRoom } from './lobby-room';

const MAX_USERS = 10 * 6; // TODO

export class Lobby {
	nsp: Namespace;
	rooms: Set<string> = new Set<string>();
	// rooms: Map<string, LobbyRoom> = new Map<string, LobbyRoom>(); // key = room name

	constructor(nsp: Namespace) {
		this.nsp = nsp;
	}

	createUser(socket: Socket, username: string): User|IErrorMessage {
		var id: string;
		var user = <User>socket;

		if(validateUsername(username)) {
			user.username = username;
			console.log('user created: ' + username);

			return user;
		} else {
			return {error: 'Invalid username for new user: ' + username};
		}
	}

	createRoom(socket: Socket): string|IErrorMessage {
		var roomId: string;
		do {
			roomId = idUtil.makeId();
		} while (this.rooms.has(roomId));

		return roomId;
	}

	forgetRoom(roomId: string) {
		this.rooms.delete(roomId);
	}

	getNumUsersOnline(): number {
		var nspSocketIds: string[] = Object.keys(this.nsp.sockets);
		return nspSocketIds.length;
	}
}

function validateUsername(str: string): boolean {
	// alphanumeric, 4-8 chars
	var regex = /^[a-zA-Z0-9]{4,8}$/;
	return regex.test(str);
}
