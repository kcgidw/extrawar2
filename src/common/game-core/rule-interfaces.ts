import { Entity } from "./entity";
import { IEventCause } from "./event-interfaces";
import { Lane } from "./match";

export const ROOM_SIZE = 4;

export enum Phase {
	CHOOSE_CHARACTER, PLAN, RESOLVE, GAME_OVER
}

export enum Faction {
	FERALIST, MOLTEN, ABERRANT, ETHER, KINDRED, GLOOMER, NONE
}

// character info & base stats
export interface IEntityProfile {
	id: string;
	faction: Faction;
	name: string;
	maxHp: number;
	str: number;
}

export interface IStefDef {
	id: string;
	name: string;
	desc: string;
	isBeneficial: boolean; // helpful vs detrimental
	forLane?: boolean; // terrain effect?
}

export enum TargetWhat {
	NONE, ENTITY, ALLY, ENEMY, LANE,
}
export enum TargetRange {
	IN_LANE, NEARBY, ANY,
}

export interface ITargetInfo {
	what: TargetWhat;
	range: TargetRange;
}

