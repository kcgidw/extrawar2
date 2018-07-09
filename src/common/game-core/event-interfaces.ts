
export interface IEventCause {
	entityId: number;
	actionId: number;
	target: number; // entityId or laneY
	results: IEventResult[];
}

export enum TurnEventResultType {
	NONE, HP_CHANGE, GAIN_STEF, LOSE_STEF, DEATH, RESPAWN, AP_CHANGE,
}

export interface IEventResult {
	type: TurnEventResultType;
	custom?: object;
}
export interface IHpChangeResult extends IEventResult {
	type: TurnEventResultType.HP_CHANGE;
	entityId: number;
	value: number;
}
export interface IGainStefResult extends IEventResult {
	type: TurnEventResultType.GAIN_STEF;
	entityId: number;
	stefId: number;
}
export interface IDeathResult extends IEventResult {
	type: TurnEventResultType.DEATH;
	entityId: number;
}
export interface IRespawnResult extends IEventResult {
	type: TurnEventResultType.RESPAWN;
	entityId: number;
}
export interface INoneResult extends IEventResult {
	type: TurnEventResultType.NONE;
	reason: string;
}
export interface IApChangeResult extends IEventResult {
	type: TurnEventResultType.AP_CHANGE;
	entityId: number;
	value: number;
}
