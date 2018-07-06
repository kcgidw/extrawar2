import * as SocketIO from 'socket.io';
import * as Msgs from '../../common/messages';
import { SOCKET_MSG } from '../../common/messages';
import { Lobby } from '../lobby/lobby';
import { User } from '../lobby/user';
import { ChatRoom } from './chat-room';

export function handleChat(nsp: SocketIO.Namespace, lobby: Lobby, sock: SocketIO.Socket) {
	sock.on(SOCKET_MSG.CHAT_POST_MESSAGE, (data: Msgs.IChatPostMessageRequest) => {
		var user: User = (<User>sock);
		var chatRoom: ChatRoom = user.gameRoom;
		if(chatRoom) {
			var rmId: string = chatRoom.roomId;
			var result: Msgs.IChatPostMessageResponse = chatRoom.createMessage(user, data);
			
			nsp.to(rmId).emit(SOCKET_MSG.CHAT_POST_MESSAGE, result);
		} else {
			sock.emit(SOCKET_MSG.CHAT_POST_MESSAGE, <Msgs.IChatPostMessageResponse>{
				messageName: SOCKET_MSG.CHAT_POST_MESSAGE,
				message: undefined,
				error: 'Undefined room'
			});
		}
	});
	sock.on('disconnect', () => {
		var user: User = (<User>sock);
		var chatRoom: ChatRoom = user.gameRoom;
		if(chatRoom) {
			var rmId: string = chatRoom.roomId;
			
			nsp.to(rmId).emit(SOCKET_MSG.CHAT_POST_MESSAGE, <Msgs.IChatPostMessageResponse>{
				messageName: SOCKET_MSG.CHAT_POST_MESSAGE,
				username: undefined,
				message: user.username + ' has disconnected.',
				timestamp: new Date(),
			});
		}
	});
}
