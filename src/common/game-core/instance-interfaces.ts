import { IStefDef } from "./rule-interfaces";

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

export interface ILaneState {
	y: number;
	stefs1: IStefInstance[];
	stefs2: IStefInstance[];
}

