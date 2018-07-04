import { Namespace } from "socket.io";

export function getUsersInNsp(nsp: Namespace) {
	var nspSocketIds = Object.keys(nsp.sockets);
	return nspSocketIds;
}
export function getUsersInRoom(nsp: Namespace, roomId: string) {
	return Object.keys(nsp.adapter.rooms[roomId].sockets);
}
