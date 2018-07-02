import * as SocketIO from 'socket.io';
import * as Messages from '../common/messages';
import { IErrorMessage } from '../common/messages';
import { Lobby } from './lobby/lobby';
import { User } from './lobby/user';

const SOCKET_MESSAGES = Messages.SOCKET_MESSAGES;
const isError = Messages.isError;
var lobby: Lobby;

export function handleServerGames(io: SocketIO.Server) {
	lobby = new Lobby(io);

	io.on('connection', (sock) => { 

		sock.on('disconnect', () => {
			// lobby.handleDisconnect(sock);
			io.emit(SOCKET_MESSAGES.NUM_ONLINE, <Messages.INumOnlineResponse>{count: lobby.getNumUsersOnline()});
		});
		
		sock.on(SOCKET_MESSAGES.NUM_ONLINE, () => {
			sock.emit(SOCKET_MESSAGES.NUM_ONLINE, <Messages.INumOnlineResponse>{count: lobby.getNumUsersOnline()});
		});

		sock.on(SOCKET_MESSAGES.CREATE_USER, (data: Messages.ICreateUserRequest) => {
			let response: Messages.ICreateUserResponse|Messages.IErrorMessage;

			let result: User|Messages.IErrorMessage = lobby.createUser(sock, data.username);

			if(!isError(result)) {
				response = { username: (<User>result).username };
			} else {
				response = <IErrorMessage>result;
			}

			sock.emit(SOCKET_MESSAGES.CREATE_USER, response);
			io.emit(SOCKET_MESSAGES.NUM_ONLINE, <Messages.INumOnlineResponse>{count: lobby.getNumUsersOnline()});
		});

		sock.on(SOCKET_MESSAGES.CREATE_ROOM, () => {
			let response: Messages.ICreateRoomResponse|Messages.IErrorMessage;

			let result: string|Messages.IErrorMessage = lobby.createRoom(sock);

			if(!isError(result)) {
				response = <Messages.ICreateRoomResponse>{ roomId: result };
			} else {
				response = <IErrorMessage>result;
			}

			sock.emit(SOCKET_MESSAGES.CREATE_ROOM, response);
		});
		
	});
}
