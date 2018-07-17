import { Entity } from "./entity";
import { User } from "../../server/lobby/user";
import { randItem } from "../../server/lobby/util";

export const ROOM_SIZE = 4;

export enum Phase {
	CHOOSE_CHARACTER, CHOOSE_STARTING_LANE, PLAN, RESOLVE, GAME_OVER
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


export type Team = 1|2;

export interface IEntityState {
	entityId: number;
	ready: boolean;

	maxHp: number;
	hp: number;
	ap: number;
	deaths: number;
	respawn: number;
	nextRespawn: number;

	passiveSlots: number;
	activeSlots: number;
	passives: number[];
	actives: number[];

	stefs: IStefInstance[];

	y: number;
}

export interface ICooldown {
	skill: string;
	cooldown: number;
}

export interface IStefInstance {
	stefId: string;
	duration: number;
	invokerId: number; // entity that applied this stef
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
	stefs1: IStefInstance[];
	stefs2: IStefInstance[];

	constructor(y: number) {
		this.y = y;
	}

	getRandomEntity(team: Team): Entity {
		var from: Entity[] = this['team'+team];
		return randItem<Entity>(from);
	}
}