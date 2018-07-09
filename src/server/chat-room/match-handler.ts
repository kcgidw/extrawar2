import { Phase } from "../../common/game-core/rule-interfaces";
import * as Msgs from '../../common/messages';
import { SOCKET_MSG } from "../../common/messages";
import { User } from "../lobby/user";
import { ChatRoom } from "./chat-room";

export function handleMatch(nsp: SocketIO.Namespace, sock: SocketIO.Socket) {
	sock.on(SOCKET_MSG.START_GAME, () => {
		var user: User = (<User>sock);
		var chatRoom: ChatRoom = user.gameRoom;
		if(chatRoom) {
			let rmId: string = chatRoom.roomId;

			let match = chatRoom.createMatch();
			
			chatRoom.users.forEach((curUsr) => {
				curUsr.emit(SOCKET_MSG.START_GAME, <Msgs.IStartGameResponse>{
					messageName: SOCKET_MSG.START_GAME,
					username: user.username,
					timestamp: new Date(),
					characterChoiceIds: match.characterChoices[curUsr.username],
				});
			});
		} else {
			sock.emit(SOCKET_MSG.START_GAME, <Msgs.IStartGameResponse>{
				messageName: SOCKET_MSG.START_GAME,
				error: 'Undefined room',
			});
		}
	});

	sock.on(SOCKET_MSG.CHOOSE_CHARACTER, (data: Msgs.IPlayerDecisionRequest) => {
		var user: User = (<User>sock);
		var chatRoom: ChatRoom = user.gameRoom;
		var errMsg: string;
		var result: boolean;
		
		if(chatRoom) {
			if(chatRoom.match) {
				if(chatRoom.match.phase === Phase.CHOOSE_CHARACTER) {
					result = chatRoom.match.enqueueCharacterChoice(user, data.entityProfileId);
					if(!result) {
						errMsg = 'Unhandled character choice error';
					}
				} else {
					errMsg = 'Game phase mismatch';
				}
			} else {
				errMsg = 'Game not started';
			}
		} else {
			errMsg = 'Undefined room';
		}

		if(errMsg || result !== true) {
			sock.emit(SOCKET_MSG.CHOOSE_CHARACTER, <Msgs.IPlayerDecisionResponse>{
				messageName: SOCKET_MSG.CHOOSE_CHARACTER,
				error: errMsg
			});
		} else {
			sock.emit(SOCKET_MSG.CHOOSE_CHARACTER, <Msgs.IPlayerDecisionResponse>{
				messageName: SOCKET_MSG.CHOOSE_CHARACTER,
				entityProfileId: data.entityProfileId
			});
		}
	});
}