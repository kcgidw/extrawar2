import * as Msgs from '../common/messages';
import {SOCKET_MSG} from '../common/messages';

const socket = io('/lobby');
socket.emit(SOCKET_MSG.LOBBY_NUM_ONLINE);

export function onNumOnlineReceived(fn: (data: Msgs.INumOnlineResponse)=>any) {
	handleResponse(SOCKET_MSG.LOBBY_NUM_ONLINE, fn);
}

export function sendUsername(username: string) {
	socket.emit(SOCKET_MSG.LOBBY_CREATE_USER, { username: username } as Msgs.ICreateUserRequest);
}
export function onUsernameResponse(fn: (data: Msgs.ICreateUserResponse)=>any, errorFn?) {
	handleResponse(SOCKET_MSG.LOBBY_CREATE_USER, fn, errorFn);
}

export function sendCreateRoom() {
	socket.emit(SOCKET_MSG.LOBBY_CREATE_ROOM);
}
export function onCreateRoomResponse(fn: (data: Msgs.ICreateRoomResponse)=>any, errorFn?) {
	handleResponse(SOCKET_MSG.LOBBY_CREATE_ROOM, fn, errorFn);
}
export function sendJoinRoom(roomId: string) {
	socket.emit(SOCKET_MSG.LOBBY_JOIN_ROOM, {roomId: roomId} as Msgs.IJoinRoomRequest);
}
export function onJoinRoomResponse(fn: (data: Msgs.IJoinRoomResponse)=>any, errorFn?) {
	handleResponse(SOCKET_MSG.LOBBY_JOIN_ROOM, fn, errorFn);
}

export function sendChatMessage(msg: string) {
	socket.emit(SOCKET_MSG.CHAT_POST_MESSAGE, {message: msg} as Msgs.IChatPostMessageRequest);
}

function handleResponse(messageType: string, fn: (data: object)=>any, errorFn?: (data: Msgs.IErrorMessage)=>any) {
	socket.on(messageType, (data) => {
		if(Msgs.isError(data)) {
			if(errorFn) {
				errorFn(data as Msgs.IErrorMessage);
			}
			console.warn('Unhandled error message: ' + data.error);
		} else {
			fn(data);
		}
	});
}
