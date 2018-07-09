import { IStatusEffectDef } from "./rule-interfaces";

export interface IEntityState {
	entityId: number;

	hp: number;
	ap: number;
	deaths: number;
	respawn: number;

	passiveSlots: number;
	activeSlots: number;
	passives: number[];
	actives: number[];

	stefs: IStefInstance[];

	y: number;
}

export interface ICooldown {
	skillId: number;
	cooldown: number;
}

export interface IStefInstance {
	stef: IStatusEffectDef;
	duration: number;
	invokerId: number; // entity that applied this stef
}

export interface ILaneState {
	y: number;
	stefs1: IStefInstance[];
	stefs2: IStefInstance[];
}

export interface ILane {
	y: number;
	side: 1|2; 
}
