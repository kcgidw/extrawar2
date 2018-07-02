export interface IErrorMessage {
	error: string;
}
export function isError(obj: any): boolean {
	return obj instanceof Object && Object.keys(obj).length === 1 && obj['error'];
}

export const SOCKET_MESSAGES = {
	'NUM_ONLINE': 'NUM_ONLINE',
	'CREATE_USER': 'CREATE_USER',
	'CREATE_ROOM': 'CREATE_ROOM',
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