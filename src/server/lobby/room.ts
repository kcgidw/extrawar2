import {Namespace} from 'socket.io';
import { LobbyUser } from './user';

export class LobbyRoom {
	id: string; // ensure snyonymous w/ the ioNamespace name
	users: Set<LobbyUser>;
	ioNamespace: Namespace;

	constructor(id: string) {
		this.id = id;
	}

	admitUser(user: LobbyUser) {
		this.users.add(user);
		user.setRoom(this);
	}
	dropUser(user: LobbyUser) {
		if(this.users.has(user)) {
			this.users.delete(user);
			if(user.socket) {
				user.socket.leave(this.id);
				user.room = undefined;
			}
		} else {
			console.warn(`user ${user.id} (${user.name}) does not exist`);
		}
	}
}
