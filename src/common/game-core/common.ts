import { Entity } from "./entity";
import { User } from "../../server/lobby/user";
import { randItem } from "../../server/lobby/util";
import { ISkillInstance } from "../game-info/skills";

export const ROOM_SIZE = 4;

export enum Phase {
	WAITING_ROOM, CHOOSE_CHARACTER, CHOOSE_STARTING_LANE, PLAN, RESOLVE, GAME_OVER
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
	image: string;
	emptyProfile?: boolean;
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
	entityId: string;
	ready: boolean;

	maxHp: number;
	hp: number;
	maxAp: number;
	ap: number;

	deaths: number;
	respawn: number;
	nextRespawn: number;
	diedTurn: number;

	passiveSlots: number;
	activeSlots: number;
	passiveIds: string[];
	actives: ISkillInstance[];

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
	invokerEntityId: string; // entity that applied this stef
	invokedTurn: number;
}

export interface IMatchState {
	players: {[username: string]: Entity};
	team1: string[];
	team2: string[];
	turn: number;
	phase: Phase;
	lanes: Lane[];
	characterChoicesIds?: {[key: string]: string[]};
	actionChoicesIds?: {[key: string]: string[]};
	playersReady: {[key: string]: boolean}; // only for client use
}

export class Lane {
	y: number;
	stefs1: IStefInstance[];
	stefs2: IStefInstance[];

	constructor(y: number) {
		this.y = y;
	}
}