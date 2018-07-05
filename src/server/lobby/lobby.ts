import { Namespace, Socket } from 'socket.io';
import { ICreateRoomResponse, ICreateUserResponse, IJoinRoomResponse, SOCKET_MSG } from '../../common/messages';
import { validateUsername } from '../../common/validate';
import { ChatRoom } from '../game-room/chat-room';
import { getUsersInNsp } from '../socket-util';
import * as idUtil from './id-util';
import { User } from './user';

const MAX_USERS = 10 * 6; // TODO
const ROOM_MAX_USERS: number = 6;

export class Lobby {
	nsp: Namespace;
	rooms: Map<string, ChatRoom> = new Map<string, ChatRoom>();

	constructor(nsp: Namespace) {
		this.nsp = nsp;
	}

	createUser(socket: Socket, username: string): ICreateUserResponse {
		var id: string;
		var user = <User>socket;

		if(validateUsername(username)) {
			user.username = username;
			console.log('create user: ' + username);

			return {
				messageName: SOCKET_MSG.LOBBY_CREATE_USER,
				username: username
			};
		}
		return {
			messageName: SOCKET_MSG.LOBBY_CREATE_USER,
			username: undefined,
			error: 'Invalid username'
		};
	}

	createRoom(socket: Socket): ICreateRoomResponse {
		var roomId: string;
		do {
			roomId = idUtil.makeId();
		} while (this.rooms.has(roomId));

		var room = new ChatRoom(this.nsp, roomId);
		this.rooms.set(roomId, room);

		this.joinRoom(socket, roomId);

		console.log('create room: ' + roomId);

		return {
			messageName: SOCKET_MSG.LOBBY_CREATE_ROOM,
			roomId: roomId,
		};
	}

	joinRoom(socket: Socket, roomId: string): IJoinRoomResponse {
		roomId = roomId.toLowerCase();
		var rm: ChatRoom = this.rooms.get(roomId);
		if(rm && rm.users.length < ROOM_MAX_USERS) {
			socket.join(roomId);
			rm.admitUser(<User>socket);
			return {
				messageName: SOCKET_MSG.LOBBY_JOIN_ROOM,
				roomId: roomId,
				users: rm.getUsernames(),
			};
		}
		return {
			messageName: SOCKET_MSG.LOBBY_JOIN_ROOM,
			roomId: undefined,
			users: undefined,
			error: 'Cannot enter room', // Hide reason from user
		};
	}

	forgetRoom(roomId: string) {
		if(this.rooms.has(roomId)) {
			this.rooms.delete(roomId);
			delete this.nsp.adapter.rooms[roomId];
		}
	}

	getNumUsersOnline(): number {
		return getUsersInNsp(this.nsp).length;
	}
}

