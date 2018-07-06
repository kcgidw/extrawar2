export const ROOM_SIZE = 4;

export enum Phase {
	CHOOSE_CHARACTER, PLAN, RESOLVE,
}

export enum Faction {
	FERALIST, 
}

// character info & base stats
export interface IEntityProfile {
	faction: Faction;
	name: string;
	maxHp: number;
	str: number;
}

export interface IStatusEffectDef {
	name: string;
	desc: string;
	beneficial: boolean; // helpful vs detrimental
	lane: boolean; // terrain effect?
}

export enum ITargetWhat {
	NONE, ENTITY, ALLY, ENEMY, LANE,
}
export enum ITargetLimitation {
	IN_LANE, NEARBY, ANY,
}

export interface ITargetInfo {
	what: ITargetWhat;
	limitation: ITargetLimitation;
}

export interface ISkillDef {
	active: boolean; // active vs passive
	faction: Faction;
	name: string;
	desc: string;
	keywords: string[]; // supplementary descriptons for stefs and whatnot
	target: ITargetInfo;
}

