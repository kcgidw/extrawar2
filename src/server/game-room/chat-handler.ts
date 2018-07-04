import * as SocketIO from 'socket.io';
import * as Messages from '../../common/messages';
import { IErrorMessage, isError, SOCKET_MESSAGES } from '../../common/messages';
import { Lobby } from '../lobby/lobby';
import { User } from '../lobby/user';
import { ChatRoom } from './chat-room';

export function handleChat(nsp: SocketIO.Namespace, lobby: Lobby, sock: SocketIO.Socket) {
	sock.on(SOCKET_MESSAGES.CHAT_POST_MESSAGE, (data: Messages.IChatPostMessageRequest) => {
		var user: User = (<User>sock);
		var chatRoom: ChatRoom = user.gameRoom;
		if(chatRoom) {
			var rmId: string = chatRoom.roomId;
			var result: Messages.IChatPostMessageResponse|IErrorMessage = chatRoom.createMessage(user, data.message);
			
			nsp.to(rmId).emit(SOCKET_MESSAGES.CHAT_POST_MESSAGE, result);
		}
	});
}
