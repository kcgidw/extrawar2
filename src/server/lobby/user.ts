import { Socket } from 'socket.io';
import { ChatRoom } from '../chat-room/chat-room';

export interface User extends Socket {
	username: string;
	gameRoom: ChatRoom;
}
