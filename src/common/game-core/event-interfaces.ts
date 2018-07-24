import { IMatchState, Lane, Team } from "./common";
import { Skills } from "../game-info/skills";
import { Entity } from "./entity";
import { actionDefTargetsEntity } from "../../server/lobby/util";

export interface IEventCause {
	entityId: string;
	actionDefId: string;
	targetId: string|number; // entityId or laneY
	results: IEventResult[];
}

export enum TurnEventResultType {
	NONE='NONE',
	HP_CHANGE='HP_CHANGE',
	GAIN_STEF='GAIN_STEF',
	LOSE_STEF='LOSE_STEF', 
	DEATH='DEATH',
	RESPAWN='RESPAWN', 
	AP_CHANGE='AP_CHANGE',
	CHANGE_LANE='CHANGE_LANE',
	GAME_OVER='GAME_OVER',
}

export interface IEventResult {
	type: TurnEventResultType;
	custom?: object;
	newMatchState: IMatchState;
}
export interface IHpChangeResult extends IEventResult {
	type: TurnEventResultType.HP_CHANGE;
	entityId: string;
	value: number;
}
export interface IGainStefResult extends IEventResult {
	type: TurnEventResultType.GAIN_STEF;
	entityId: string;
	stefId: string;
}
export interface IDeathResult extends IEventResult {
	type: TurnEventResultType.DEATH;
	entityId: string;
}
export interface IRespawnResult extends IEventResult {
	type: TurnEventResultType.RESPAWN;
	entityId: string;
}
export interface IGameOverResult extends IEventResult {
	type: TurnEventResultType.GAME_OVER;
	winner: Team;
}
export interface INoneResult extends IEventResult {
	type: TurnEventResultType.NONE;
	entityId?: string;
	reason: string;
}
export interface IApChangeResult extends IEventResult {
	type: TurnEventResultType.AP_CHANGE;
	entityId: string;
	value: number;
}
export interface IChangeLangeResult extends IEventResult {
	type: TurnEventResultType.CHANGE_LANE;
	entityId: string;
	laneId: number;
}

export interface IActionResolutionTimeline {
	causes: IEventCause[];
}

export const EventResultTexts: {[key: string]: (result?: IEventResult)=>string} = {
	'NONE': ()=>'Nothing happened.',
	'HP_CHANGE': (result: IHpChangeResult) => {
		if(result.value > 0) {
			return `${result.entityId} gains ${result.value} HP.`;
		}
		return `${result.entityId} loses ${Math.abs(result.value)} HP.`;
	},
	'GAIN_STEF': undefined,
	'LOSE_STEF': undefined,
	'DEATH': (result: IDeathResult) => `${result.entityId} dies.`,
	'RESPAWN': (result: IRespawnResult) => `${result.entityId} respawns.`,
	'AP_CHANGE': (result: IApChangeResult) => {
		if(result.value > 0) {
			return `${result.entityId} gains ${result.value} AP.`;
		}
		return `${result.entityId} loses ${Math.abs(result.value)} AP.`;
	},
	'CHANGE_LANE': (result: IChangeLangeResult) => {
		return `${result.entityId} moves to lane ${result.laneId}.`;
	},
	'GAME_OVER': (result: IGameOverResult) => {
		return `Game over! Team ${result.winner} wins!`;
	},
};


export interface IFlatEvent {
	message: string;
	newState: IMatchState;
}

export function flatReport(ms: IMatchState, causes: IEventCause[]): IFlatEvent[] {
	var res: IFlatEvent[] = [];
	causes.forEach((cause) => {
		res = res.concat(reportCause(ms, cause));
	});
	return res;
}
export function reportCause(ms: IMatchState, cause: IEventCause): IFlatEvent[] {
	var actionDef = Skills[cause.actionDefId];
	var ent = ms.players[cause.entityId];
	var tar: Entity|Lane;

	if(actionDefTargetsEntity(actionDef)) {
		tar = ms.phase[cause.targetId];
	} else {
		tar = ms.lanes[cause.targetId];
	}

	var lines: IFlatEvent[] = [{
		message: actionDef.resultMessage(ent, tar),
		newState: undefined,
	}];

	for(let res of cause.results) {
		var message = EventResultTexts[res.type](res);
		if(message) {
			lines.push({
				message: message,
				newState: res.newMatchState,
			});
		}
	}

	return lines;
}