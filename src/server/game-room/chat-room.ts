import * as SocketIO from 'socket.io';
import { ChatMessage } from './chat-message';
import { User } from '../lobby/user';
import * as Messages from '../../common/messages';

const CHAT_LOG_CAPACITY = 15;

export class ChatRoom {
	nsp: SocketIO.Namespace;
	roomId: string;
	chatLog: ChatMessage[];

	constructor(nsp: SocketIO.Namespace, roomId: string) {
		this.nsp = nsp;
		this.roomId = roomId;
	}

	addChatLog(user: User, post: string) {
		var cp: ChatMessage = new ChatMessage(user, post);
		this.chatLog.push(cp);
		while(this.chatLog.length > CHAT_LOG_CAPACITY) { // should happen just once, but to be safe
			this.chatLog.shift();
		}
	}

	getRecentChatMessages(numMessages: number): ChatMessage[] {
		return this.chatLog.slice(numMessages * -1);
	}

	createMessage(user: User, message: string): Messages.IChatPostMessageResponse {
		return {
			user: user.username,
			message: message,
		};
	}
}
