import * as SocketIO from 'socket.io';
import * as Messages from '../common/messages';
import { Lobby } from './lobby/lobby';
import { LobbyRoom } from './lobby/room';
import { LobbyUser } from './lobby/user';

const SOCKET_MESSAGES = Messages.SOCKET_MESSAGES;
var lobby = new Lobby();

export function handleServerGames(io: SocketIO.Server) {
	io.on('connection', (sock) => { 

		// TODO disconnection, update num users
		
		sock.on(SOCKET_MESSAGES.NUM_ONLINE, () => {
			sock.emit(SOCKET_MESSAGES.NUM_ONLINE, lobby.getNumUsersOnline());
		});

		sock.on(SOCKET_MESSAGES.CREATE_USER, (data: Messages.ICreateUserRequest) => {
			let response: Messages.ICreateUserResponse|Messages.IErrorMessage;

			let result: LobbyUser|Messages.IErrorMessage = lobby.createUser(sock, data.username);
			if(result instanceof LobbyUser) {
				response = { username: result.name };
			} else { // error
				response = result;
			}

			sock.emit(SOCKET_MESSAGES.CREATE_USER, response);
			io.emit(SOCKET_MESSAGES.NUM_ONLINE, <Messages.INumOnlineResponse>{count: lobby.getNumUsersOnline()});
		});

		sock.on(SOCKET_MESSAGES.CREATE_ROOM, () => {
			let response: Messages.ICreateRoomResponse|Messages.IErrorMessage;

			let user: LobbyUser = sock['user'];
			let result: LobbyRoom|Messages.IErrorMessage = lobby.createRoom(user);
			if(result instanceof LobbyRoom) {
				response = { roomId: result.id };
			} else { // error
				response = result;
			}

			sock.emit(SOCKET_MESSAGES.CREATE_ROOM, response);
		});
		
	});
}
