import * as SocketIO from 'socket.io';
import * as Msgs from '../../common/messages';
import { SOCKET_MSG } from '../../common/messages';
import { Lobby } from '../lobby/lobby';
import { User } from '../lobby/user';
import { ChatRoom } from './chat-room';
import { handleMatch } from './match-handler';

export function handleChat(nsp: SocketIO.Namespace, lobby: Lobby, sock: SocketIO.Socket) {
	handleMatch(nsp, sock);

	sock.on(SOCKET_MSG.CHAT_POST_MESSAGE, (data: Msgs.IChatPostMessageRequest) => {
		var user: User = (<User>sock);
		var chatRoom: ChatRoom = user.gameRoom;
		if(chatRoom) {
			var rmId: string = chatRoom.roomId;
			var result: Msgs.IChatPostMessageResponse = chatRoom.addMessage(user, data);
			
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

			nsp.to(rmId).emit(SOCKET_MSG.LOBBY_ROOM_USERS, <Msgs.IRoomUsersResponse>{
				messageName:  SOCKET_MSG.LOBBY_ROOM_USERS,
				roomId: rmId,
				users: chatRoom.getUsernames(),
				username: user.username,
				joined: false,
			});
		}
	});
}
