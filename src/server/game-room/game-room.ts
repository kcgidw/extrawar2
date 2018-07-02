import * as SocketIO from 'socket.io';
import { ChatMessage } from './chat-message';
import { User } from '../lobby/user';

const CHAT_LOG_CAPACITY = 15;

export class GameRoom {
	namespaceName: string;
	chatLog: ChatMessage[];

	constructor(namespaceName: string) {
		this.namespaceName = namespaceName;
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
}
