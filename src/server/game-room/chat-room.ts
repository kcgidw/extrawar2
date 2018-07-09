import * as SocketIO from 'socket.io';
import { User } from '../lobby/user';
import * as Messages from '../../common/messages';

const CHAT_LOG_CAPACITY = 15;
const MAX_PLAYERS = 6; // any more = spectators

/*
Since socketio rooms aren't really useful objects afaik, ChatRooms are a sort of room abstraction.
They're linked to socketio rooms only by roomId.
For now, this is basically JUST A DATA STORE. Leave socketio interactions to the Lobby.
*/

export class ChatRoom {
	nsp: SocketIO.Namespace;
	roomId: string;
	
	chatLog: Messages.IChatPostMessageResponse[] = [];

	users: User[] = [];
	players: User[] = [];
	spectators: User[] = [];

	constructor(nsp: SocketIO.Namespace, roomId: string) {
		this.nsp = nsp;
		this.roomId = roomId;
	}

	admitUser(user: User) {
		this.users.push(user);
		user.gameRoom = this;
		if(this.users.length <= MAX_PLAYERS) {
			this.players.push(user);
		} else {
			this.spectators.push(user);
		}
	}
	forgetUser(user: User): string[] {
		var idx: number = this.users.findIndex((u: User) => {
			return u.username === user.username;
		});
		if(idx !== -1) {
			this.users.splice(idx, 1);
			user.gameRoom = undefined;
		}
		return this.getUsernames();
	}

	getRecentChatMessages(numMessages: number): Messages.IChatPostMessageResponse[] {
		return this.chatLog.slice(numMessages * -1);
	}

	addMessage(user: User, req: Messages.IChatPostMessageRequest): Messages.IChatPostMessageResponse {
		var msg: Messages.IChatPostMessageResponse = {
			messageName: Messages.SOCKET_MSG.CHAT_POST_MESSAGE,
			username: user.username,
			timestamp: new Date(),
			message: req.message,
		};
		this.chatLog.push(msg);
		while(this.chatLog.length > CHAT_LOG_CAPACITY) { // should happen just once, but to be safe
			this.chatLog.shift();
		}

		return msg;
	}

	getUsernames(): string[] {
		return this.users.map((u)=>u.username);
	}
}

