import { Socket } from 'socket.io';
import { ChatRoom } from '../game-room/chat-room';

export interface User extends Socket {
	username: string;
	gameRoom: ChatRoom;
}
