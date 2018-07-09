
export interface ITurnEventCause {
	entityId: number;
	actionId: number;
	target: number; // entityId or lane
	results: ITurnEventResult[];
}

export enum TurnEventResultType {
	NONE, HP_CHANGE, GAIN_STEF, LOSE_STEF, DEATH, RESPAWN, AP_CHANGE,
}

export interface ITurnEventResult {
	type: TurnEventResultType;
}
export interface IHpChangeResult extends ITurnEventResult {
	type: TurnEventResultType.HP_CHANGE;
	entityId: number;
	value: number;
}
export interface IGainStefResult extends ITurnEventResult {
	type: TurnEventResultType.GAIN_STEF;
	entityId: number;
	stefId: number;
}
export interface IDeathResult extends ITurnEventResult {
	type: TurnEventResultType.DEATH;
	entityId: number;
}
export interface IRespawnResult extends ITurnEventResult {
	type: TurnEventResultType.RESPAWN;
	entityId: number;
}
export interface INoneResult extends ITurnEventResult {
	type: TurnEventResultType.NONE;
	reason: string;
}
export interface IApChangeResult extends ITurnEventResult {
	type: TurnEventResultType.AP_CHANGE;
	entityId: number;
	value: number;
}
