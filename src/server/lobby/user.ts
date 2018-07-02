import { Socket } from 'socket.io';

export interface User extends Socket {
	username: string;
}
