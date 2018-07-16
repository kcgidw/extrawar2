import { User } from "../../server/lobby/user";
import { randItem } from "../../server/lobby/util";
import { IEntityProfile, ILaneState, Phase, Team } from "./common";
import { Entity } from "./entity";

interface ICharacterChoice {
	user: User;
	entProfile: IEntityProfile;
}

export interface IMatchState {
	players: {[username: string]: Entity};
	team1: string[];
	team2: string[];
	turn: number;
	phase: Phase;
	lanes: Lane[];
	characterChoicesIds: {[key: string]: string[]};
	playersReady: {[key: string]: boolean};
}

export class Lane {
	y: number;
	team1: Entity[] = [];
	team2: Entity[] = [];
	state: ILaneState;

	constructor(y: number) {
		this.y = y;
	}

	getRandomEntity(team: Team): Entity {
		var from: Entity[] = this['team'+team];
		return randItem<Entity>(from);
	}
	
}