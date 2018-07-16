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
			let mstate = match.exportState();
			
			chatRoom.users.forEach((curUsr) => {
				curUsr.emit(SOCKET_MSG.START_GAME, <Msgs.IPresentGamePhase>{
					messageName: SOCKET_MSG.START_GAME,
					requestorUsername: user.username,
					phase: Phase.CHOOSE_CHARACTER,
					matchState: mstate,
				});
			});
		} else {
			sock.emit(SOCKET_MSG.START_GAME, <Msgs.IPresentGamePhase>{
				messageName: SOCKET_MSG.START_GAME,
				phase: undefined,
				matchState: undefined,
				error: 'Undefined room',
			});
		}
	});

	sock.on(SOCKET_MSG.PLAYER_DECISION, (data: Msgs.IPlayerDecisionRequest) => {
		var user: User = (<User>sock);
		var chatRoom: ChatRoom = user.gameRoom;
		var errMsg: string;
		var result: boolean;
		
		if(chatRoom) {
			if(chatRoom.match) {
				if(chatRoom.match.phase === Phase.CHOOSE_CHARACTER) {
					chatRoom.match.enqueuePlayerDecision(user, data);
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
			nsp.to(chatRoom.roomId).emit(SOCKET_MSG.PLAYERS_READY, {matchState: chatRoom.match.exportState()});
		} else {
			sock.emit(SOCKET_MSG.PLAYER_DECISION, <Msgs.IPlayerDecisionResponse>{
				messageName: SOCKET_MSG.PLAYER_DECISION,
				entityProfileId: data.entityProfileId
			});
		}
	});
}