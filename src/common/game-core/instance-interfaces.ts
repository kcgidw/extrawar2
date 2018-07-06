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

export interface IEntityTargetingDecision {
	targetId: number;
}
export interface ILaneTargetingDecision {
	y: number;
	side: 1|2; 
}

export interface ITurnEventCause {
	entityId: number;
	actionId: number;
	target: IEntityTargetingDecision|ILaneTargetingDecision;
	results: ITurnEventResult[];
}

export enum TurnEventResultType {
	NONE, HP_CHANGE, GAIN_STEF, LOSE_STEF, DEATH, RESPAWN, AP_CHANGE,
}

export interface ITurnEventResult {
	type: TurnEventResultType;
	entityId?: number;
	stefId?: number;
	value?: number;
}
