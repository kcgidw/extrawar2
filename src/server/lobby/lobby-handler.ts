import * as SocketIO from 'socket.io';
import * as Msgs from '../../common/messages';
import { IErrorMessage, isError, SOCKET_MSG, IJoinRoomResponse } from '../../common/messages';
import { Lobby } from './lobby';
import { User } from './user';
import { ChatRoom } from '../game-room/chat-room';

var lobby: Lobby;

export function handleLobby(io: SocketIO.Server) {
	var lobbyNsp: SocketIO.Namespace = io.of('/lobby');
	lobby = new Lobby(lobbyNsp);

	lobbyNsp.on('connection', (sock) => { 
		lobbyNsp.emit(SOCKET_MSG.LOBBY_NUM_ONLINE, <Msgs.INumOnlineResponse>{count: lobby.getNumUsersOnline()});

		sock.on('disconnect', () => {
			var user = (<User>sock);
			var rm: ChatRoom = user.gameRoom;
			if(rm !== undefined) {
				let forgetResult: string[] = rm.forgetUser(user);
				let roomBroadcast = <Msgs.IJoinRoomResponse>{
					roomId: rm.roomId,
					users: forgetResult,
				};
				if(rm.users.length > 0) {
					lobbyNsp.to(rm.roomId).emit(SOCKET_MSG.LOBBY_JOIN_ROOM, roomBroadcast);
				} else {
					lobby.forgetRoom(rm.roomId);
				}
			}
			lobbyNsp.emit(SOCKET_MSG.LOBBY_NUM_ONLINE, <Msgs.INumOnlineResponse>{count: lobby.getNumUsersOnline()});
		});
		
		sock.on(SOCKET_MSG.LOBBY_NUM_ONLINE, () => {
			sock.emit(SOCKET_MSG.LOBBY_NUM_ONLINE, <Msgs.INumOnlineResponse>{count: lobby.getNumUsersOnline()});
		});

		sock.on(SOCKET_MSG.LOBBY_CREATE_USER, (data: Msgs.ICreateUserRequest) => {
			let response: Msgs.ICreateUserResponse|Msgs.IErrorMessage;

			let result: User|Msgs.IErrorMessage = lobby.createUser(sock, data.username);

			if(!isError(result)) {
				response = { username: (<User>result).username };
			} else {
				response = <IErrorMessage>result;
			}

			sock.emit(SOCKET_MSG.LOBBY_CREATE_USER, response);
		});

		sock.on(SOCKET_MSG.LOBBY_CREATE_ROOM, () => {
			let response: Msgs.ICreateRoomResponse|Msgs.IErrorMessage;

			let result: string|Msgs.IErrorMessage = lobby.createRoom(sock);

			if(!isError(result)) {
				response = <Msgs.ICreateRoomResponse>{ roomId: result };
			} else {
				response = <IErrorMessage>result;
			}

			sock.emit(SOCKET_MSG.LOBBY_CREATE_ROOM, response);
		});

		sock.on(SOCKET_MSG.LOBBY_JOIN_ROOM, (data: Msgs.IJoinRoomRequest) => {
			var response: Msgs.IJoinRoomResponse|Msgs.IErrorMessage;

			var result: Msgs.IJoinRoomResponse|Msgs.IErrorMessage = lobby.joinRoom(sock, data.roomId);
			if(!isError(result)) {
				response = result;
				let roomId = (<IJoinRoomResponse>result).roomId;
				lobbyNsp.to(roomId).emit(SOCKET_MSG.LOBBY_JOIN_ROOM, response);
			} else {
				response = <IErrorMessage>result;
				sock.emit(SOCKET_MSG.LOBBY_JOIN_ROOM, response);
			}
		});
		
	});
}
