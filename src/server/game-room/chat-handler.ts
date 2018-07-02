import * as SocketIO from 'socket.io';
import * as Messages from '../../common/messages';
import { IErrorMessage } from '../../common/messages';

const SOCKET_MESSAGES = Messages.SOCKET_MESSAGES;
const isError = Messages.isError;

export function handleServerGames(io: SocketIO.Server, sock: SocketIO.Socket) {
	// sock.on()
}
