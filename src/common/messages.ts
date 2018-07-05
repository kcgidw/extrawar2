
export const SOCKET_MSG = {
	'LOBBY_NUM_ONLINE': 'LOBBY_NUM_ONLINE',
	'LOBBY_CREATE_USER': 'LOBBY_CREATE_USER',
	'LOBBY_CREATE_ROOM': 'LOBBY_CREATE_ROOM',
	'LOBBY_JOIN_ROOM': 'LOBBY_JOIN_ROOM',
	'CHAT_POST_MESSAGE': 'CHAT_POST_MESSAGE',
};

export interface IErrorableResponse {
	messageName: string;
	error?: string;
}

export interface INumOnlineResponse extends IErrorableResponse {
	count: number;
}
export interface ICreateUserRequest {
	username: string;
}
export interface ICreateUserResponse extends IErrorableResponse {
	username: string;
}
// no create room request obj
export interface ICreateRoomResponse extends IErrorableResponse {
	roomId: string;
}
export interface IJoinRoomRequest {
	roomId: string;
}
export interface IJoinRoomResponse extends IErrorableResponse {
	roomId: string;
	users: string[];
}
export interface IListRoomUsersResponse extends IErrorableResponse {
	users: string[];
}
export interface IChatPostMessageRequest {
	message: string;
}
export interface IChatPostMessageResponse extends IErrorableResponse {
	user: string;
	message: string;
}
