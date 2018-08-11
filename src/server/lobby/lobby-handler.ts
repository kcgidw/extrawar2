import * as SocketIO from 'socket.io';
import * as Msgs from '../../common/messages';
import { SOCKET_MSG } from '../../common/messages';
import { ChatRoom } from '../chat-room/chat-room';
import { Lobby } from './lobby';
import { User } from './user';
import { handleChat } from '../chat-room/chat-handler';
import { IMatchState } from '../../common/game-core/common';

var lobby: Lobby;

export function handleLobby(io: SocketIO.Server) {
	var lobbyNsp: SocketIO.Namespace = io.of('/lobby');
	lobby = new Lobby(lobbyNsp);

	lobbyNsp.on('connection', (sock) => { 

		// handle sub-handlers before main lobby handlers
		handleChat(lobbyNsp, lobby, sock);
		
		lobbyNsp.emit(SOCKET_MSG.LOBBY_NUM_ONLINE, <Msgs.INumOnlineResponse>{count: lobby.getNumUsersOnline()});

		sock.on('disconnect', () => {
			// update gameroom to forget user.
			// If gameroomexists and  is now empty, also force socket.io to delete the room and update
			// the lobby to forget the gameroom
			var user = (<User>sock);
			var rm: ChatRoom = user.gameRoom;
			if(rm !== undefined) {
				let forgetResult: string[] = rm.forgetUser(user);
				let roomBroadcast = <Msgs.IRoomUsersResponse>{
					roomId: rm.roomId,
					users: forgetResult,
					username: user.username,
					joined: false,
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
			let result: Msgs.ICreateUserResponse = lobby.createUser(sock, data.username);
			sock.emit(SOCKET_MSG.LOBBY_CREATE_USER, result);
		});

		sock.on(SOCKET_MSG.LOBBY_CREATE_ROOM, () => {
			let response: Msgs.ICreateRoomResponse  = lobby.createRoom(sock);
			sock.emit(SOCKET_MSG.LOBBY_CREATE_ROOM, response);
		});

		sock.on(SOCKET_MSG.LOBBY_JOIN_ROOM, (data: Msgs.IJoinRoomRequest) => {
			var response: Msgs.IRoomUsersResponse = lobby.joinRoom(sock, data.roomId);
			var room: ChatRoom = lobby.rooms.get(data.roomId);
			var existingMatchState: IMatchState = room.match ? room.match.snapshot() : undefined;
			if(response.error === undefined) {
				sock.emit(SOCKET_MSG.LOBBY_JOIN_ROOM, <Msgs.IJoinRoomResponse>{
					roomId: response.roomId,
					users: response.users,
					username: response.username,
					matchState: existingMatchState,
				});
				sock.to(response.roomId).emit(SOCKET_MSG.LOBBY_ROOM_USERS, response);
			} else {
				sock.emit(SOCKET_MSG.LOBBY_JOIN_ROOM, response);
			}
		});
		
	});
}
