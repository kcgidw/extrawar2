export interface IErrorMessage {
	error: string;
}
export function isError(obj: any): boolean {
	return obj instanceof Object && Object.keys(obj).length === 1 && obj['error'];
}

export const SOCKET_MESSAGES = {
	'LOBBY_NUM_ONLINE': 'LOBBY_NUM_ONLINE',
	'LOBBY_CREATE_USER': 'LOBBY_CREATE_USER',
	'LOBBY_CREATE_ROOM': 'LOBBY_CREATE_ROOM',
	'CHAT_POST_MESSAGE': 'CHAT_POST_MESSAGE',
};

export interface INumOnlineResponse {
	count: number;
}
export interface ICreateUserRequest {
	username: string;
}
export interface ICreateUserResponse {
	username: string;
}
export interface ICreateRoomResponse {
	roomId: string;
}
export interface IChatPostMessageRequest {
	message: string;
}
export interface IChatPostMessageResponse {
	user: string;
	message: string;
}
