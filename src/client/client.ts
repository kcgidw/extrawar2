import * as Messages from '../common/messages';

const SOCKET_MESSAGES = Messages.SOCKET_MESSAGES;

const socket = io();
socket.emit(SOCKET_MESSAGES.NUM_ONLINE);
socket.on(SOCKET_MESSAGES.NUM_ONLINE, (data: Messages.INumOnlineResponse) => {
	console.log(data.count + ' users online');
});

socket.emit(SOCKET_MESSAGES.CREATE_USER, <Messages.ICreateUserRequest>{ username: '123abc' });
socket.on(SOCKET_MESSAGES.CREATE_USER, (data: Messages.ICreateUserRequest) => {
	console.log(data);
});
