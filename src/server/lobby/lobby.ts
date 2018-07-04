import { Namespace, Socket } from 'socket.io';
import { IErrorMessage, IJoinRoomResponse } from '../../common/messages';
import { validateUsername } from '../../common/validate';
import * as idUtil from './id-util';
import { User } from './user';
import { ChatRoom } from '../game-room/chat-room';
import { getUsersInNsp } from '../socket-util';

const MAX_USERS = 10 * 6; // TODO
const ROOM_MAX_USERS: number = 6;

export class Lobby {
	nsp: Namespace;
	rooms: Map<string, ChatRoom> = new Map<string, ChatRoom>();

	constructor(nsp: Namespace) {
		this.nsp = nsp;
	}

	createUser(socket: Socket, username: string): User|IErrorMessage {
		var id: string;
		var user = <User>socket;

		if(validateUsername(username)) {
			user.username = username;
			console.log('create user: ' + username);

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

		var room = new ChatRoom(this.nsp, roomId);
		this.rooms.set(roomId, room);

		this.joinRoom(socket, roomId);

		console.log('create room: ' + roomId);

		return roomId;
	}

	joinRoom(socket: Socket, roomId: string): IJoinRoomResponse|IErrorMessage {
		roomId = roomId.toLowerCase();
		var rm: ChatRoom = this.rooms.get(roomId);
		if(rm && rm.users.length < ROOM_MAX_USERS) {
			socket.join(roomId);
			rm.admitUser(<User>socket);
			return {
				roomId: roomId,
				users: rm.getUsernames(),
			};
		}
		return { error: 'Cannot enter room' }; // Hide reason from user
	}

	forgetRoom(roomId: string) {
		this.rooms.delete(roomId);
	}

	getNumUsersOnline(): number {
		return getUsersInNsp(this.nsp).length;
	}
}

