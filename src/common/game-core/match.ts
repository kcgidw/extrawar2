import { ChatRoom } from "../../server/game-room/chat-room";
import { Entity } from "./entity";
import { Phase } from "./rule-interfaces";
import { ILaneState } from "./instance-interfaces";

export class Match {
	room: ChatRoom;
	players: Entity[];
	
	turn: number;
	phase: Phase;

	board: Lane[][];

	constructor(room: ChatRoom) {
		this.room = room;
	}
}

export class Lane {
	entities: Entity[];
	state: ILaneState;
}