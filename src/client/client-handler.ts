import { IEntityProfile } from '../common/game-core/rule-interfaces';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';

export const socket = io('/lobby');
export const clientSocket = socket;
socket.emit(SOCKET_MSG.LOBBY_NUM_ONLINE);

export function sendUsername(username: string) {
	socket.emit(SOCKET_MSG.LOBBY_CREATE_USER, { username: username } as Msgs.ICreateUserRequest);
}
export function sendCreateRoom() {
	socket.emit(SOCKET_MSG.LOBBY_CREATE_ROOM);
}
export function sendJoinRoom(roomId: string) {
	socket.emit(SOCKET_MSG.LOBBY_JOIN_ROOM, {roomId: roomId} as Msgs.IJoinRoomRequest);
}
export function sendStartGame() {
	socket.emit(SOCKET_MSG.START_GAME);
}

export function sendChatMessage(msg: string) {
	socket.emit(SOCKET_MSG.CHAT_POST_MESSAGE, {
		message: msg,
		timestamp: new Date(),
	} as Msgs.IChatPostMessageRequest);
}

/* game */

export function chooseCharacter(entProfileId: string) {
	socket.emit(SOCKET_MSG.CHOOSE_CHARACTER, {
		entityProfileId: entProfileId,
	} as Msgs.IPlayerDecisionRequest);
}

// returns a function to turn off the handler.
// remember to SAVE that function and CALL it on the unmount.
export function generateHandler<T extends Msgs.IErrorableResponse>(messageType: string, fn: (data: T)=>any, errorFn?: (data: T)=>any) {
	var handler = (data: T) => {
		if(data.error === undefined) {
			fn(data);
		} else {
			if(errorFn) {
				errorFn(data);
			} else {
				console.warn('Unhandled error message: ' + data.error);
			}
		}
	};
	socket.on(messageType, handler);
	var offCallback = () => {
		socket.off(messageType, handler);
	};
	return offCallback;
}

