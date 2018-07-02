import * as SocketIO from 'socket.io';
import * as Messages from '../../common/messages';
import { IErrorMessage } from '../../common/messages';
import { Lobby } from './lobby';
import { User } from './user';

const SOCKET_MESSAGES = Messages.SOCKET_MESSAGES;
const isError = Messages.isError;

var lobby: Lobby;

export function handleServerGames(io: SocketIO.Server) {
	var lobbyNsp: SocketIO.Namespace = io.of('/lobby');
	lobby = new Lobby(lobbyNsp);

	lobbyNsp.on('connection', (sock) => { 

		sock.on('disconnect', () => {
			// TODO: if socket not connected to lobby, no-op
			lobbyNsp.emit(SOCKET_MESSAGES.LOBBY_NUM_ONLINE, <Messages.INumOnlineResponse>{count: lobby.getNumUsersOnline()});
		});
		
		sock.on(SOCKET_MESSAGES.LOBBY_NUM_ONLINE, () => {
			sock.emit(SOCKET_MESSAGES.LOBBY_NUM_ONLINE, <Messages.INumOnlineResponse>{count: lobby.getNumUsersOnline()});
		});

		sock.on(SOCKET_MESSAGES.LOBBY_CREATE_USER, (data: Messages.ICreateUserRequest) => {
			let response: Messages.ICreateUserResponse|Messages.IErrorMessage;

			let result: User|Messages.IErrorMessage = lobby.createUser(sock, data.username);

			if(!isError(result)) {
				response = { username: (<User>result).username };
			} else {
				response = <IErrorMessage>result;
			}

			sock.emit(SOCKET_MESSAGES.LOBBY_CREATE_USER, response);
			lobbyNsp.emit(SOCKET_MESSAGES.LOBBY_NUM_ONLINE, <Messages.INumOnlineResponse>{count: lobby.getNumUsersOnline()});
		});

		sock.on(SOCKET_MESSAGES.LOBBY_CREATE_ROOM, () => {
			let response: Messages.ICreateRoomResponse|Messages.IErrorMessage;

			let result: string|Messages.IErrorMessage = lobby.createRoom(sock);

			if(!isError(result)) {
				response = <Messages.ICreateRoomResponse>{ roomId: result };
			} else {
				response = <IErrorMessage>result;
			}

			sock.emit(SOCKET_MESSAGES.LOBBY_CREATE_ROOM, response);
		});
		
	});
}
