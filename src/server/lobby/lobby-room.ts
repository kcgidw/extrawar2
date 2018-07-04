import * as SocketIO from 'socket.io';
import { ChatRoom } from '../game-room/chat-room';

export interface LobbyRoom extends SocketIO.Namespace {
	gameRoom: ChatRoom;
}
