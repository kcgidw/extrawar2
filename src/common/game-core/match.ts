import { ChatRoom } from "../../server/game-room/chat-room";
import { Entity } from "./entity";
import { Phase } from "./rule-interfaces";

export class Match {
	room: ChatRoom;
	players: Entity[];
	
	turn: number;
	phase: Phase;

	constructor(room: ChatRoom) {
		this.room = room;
	}
}
