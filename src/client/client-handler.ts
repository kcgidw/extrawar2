import { IEntityProfile, Phase, TargetWhat } from '../common/game-core/common';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import { ISkillDef } from '../common/game-info/skills';
import { actionDefTargetsEntity } from '../common/match-util';

export const socket = io('/lobby', {
	timeout: 100000
});
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
	socket.emit(SOCKET_MSG.PLAYER_DECISION, {
		phase: Phase.CHOOSE_CHARACTER,
		entityProfileId: entProfileId,
	} as Msgs.IPlayerDecisionRequest);
}

export function chooseStartingLane(laneId: number) {
	socket.emit(SOCKET_MSG.PLAYER_DECISION, {
		phase: Phase.CHOOSE_CHARACTER,
		startingLane: laneId,
	} as Msgs.IPlayerDecisionRequest);
}

export function chooseActionAndTarget(actionDef: ISkillDef, targetId: number|string, accel?: boolean) {
	socket.emit(SOCKET_MSG.PLAYER_DECISION, {
		phase: Phase.CHOOSE_CHARACTER,
		actionId: actionDef.id,
		targetEntity: actionDefTargetsEntity(actionDef) ? targetId : undefined,
		targetLane: actionDef.target.what === TargetWhat.LANE ? targetId : undefined,
		targetSkill: accel ? targetId : undefined,
	} as Msgs.IPlayerDecisionRequest);
}

export function resolveDone() {
	socket.emit(SOCKET_MSG.RESOLVE_DONE);
}

// returns a function to turn off the handler.
// remember to SAVE that function and CALL it on the unmount.
export function generateHandler<T>(messageType: string, fn: (data: T)=>any, errorFn?: (data: T)=>any) {
	var handler = (data: T) => {
		if(data['error'] === undefined) {
			fn(data);
		} else {
			console.warn('Error message: ' + data['error']);
			if(errorFn) {
				errorFn(data);
			}
		}
	};
	socket.on(messageType, handler);
	var offCallback = () => {
		socket.off(messageType, handler);
	};
	return offCallback;
}

