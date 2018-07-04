import * as Messages from '../common/messages';

const SOCKET_MESSAGES = Messages.SOCKET_MESSAGES;

const socket = io('/lobby');
socket.emit(SOCKET_MESSAGES.LOBBY_NUM_ONLINE);

export function onNumOnlineReceived(fn: (data: Messages.INumOnlineResponse)=>any) {
	handleResponse(SOCKET_MESSAGES.LOBBY_NUM_ONLINE, fn);
}

export function sendUsername(username: string) {
	socket.emit(SOCKET_MESSAGES.LOBBY_CREATE_USER, { username: username } as Messages.ICreateUserRequest);
}
export function onUsernameResponse(fn: (data: Messages.ICreateUserResponse)=>any, errorFn?: (data: Messages.IErrorMessage)=>any) {
	handleResponse(SOCKET_MESSAGES.LOBBY_CREATE_USER, fn, errorFn);
}

export function sendChatMessage(msg: string) {
	socket.emit(SOCKET_MESSAGES.CHAT_POST_MESSAGE, {message: msg} as Messages.IChatPostMessageRequest);
}

function handleResponse(messageType: string, fn: (data: object)=>any, errorFn?: (data: Messages.IErrorMessage)=>any) {
	socket.on(messageType, (data) => {
		if(Messages.isError(data)) {
			if(errorFn) {
				errorFn(data as Messages.IErrorMessage);
			}
			console.warn('Unhandled error message: ' + data);
		} else {
			fn(data);
		}
	});
}
