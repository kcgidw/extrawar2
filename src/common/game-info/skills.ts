import { Faction, IStefInstance, ITargetInfo, TargetRange, TargetWhat, Team, Lane } from "../game-core/common";
import { Entity } from "../game-core/entity";
import { IEventCause, IEventResult } from "../game-core/event-interfaces";
import { Match } from "../../server/chat-room/match";
import { otherTeam } from "../../server/lobby/util";

export interface ISkillDef {
	id: string;
	active: boolean; // active vs passive
	faction: Faction;
	name: string;
	desc: string;
	keywords: string[]; // supplementary descriptons for stefs and whatnot
	target: ITargetInfo;
	fn: (match: Match, userEntity: Entity, target: Entity|Lane, custom?: object)=>Partial<IEventCause>;
	resultMessage?: (userEntity: Entity, target?: Entity|Lane, custom?: object)=>string;
}

export const Skills: {[key: string]: ISkillDef} = {
	'ATTACK': {
		id: 'ATTACK',
		active: true,
		faction: Faction.NONE,
		name: 'Attack',
		desc: 'Attack a nearby enemy.',
		keywords: [],
		target: {
			what: TargetWhat.ENEMY,
			range: TargetRange.NEARBY
		},
		fn: (match: Match, userEntity: Entity, targetEntity: Entity) => {
			var results: IEventResult[]  = [];
			results = results.concat(simpleAttack(match, userEntity, targetEntity));
			return {results: results};
		},
		resultMessage: (userEntity, targetEntity: Entity) => {
			return userEntity.id + ' attacks.';
		}
	},
	'MOVE': {
		id: 'MOVE',
		active: true,
		faction: Faction.NONE,
		name: 'Move',
		desc: 'Move to a nearby lane.',
		keywords: [],
		target: {
			what: TargetWhat.LANE,
			range: TargetRange.NEARBY
		},
		fn: (match: Match, userEntity: Entity, targetLane: Lane) => {
			var results: IEventResult[]  = [];
			results = results.concat(match.moveEntity(userEntity, targetLane, 1));
			return {results: results};
		},
		resultMessage: (userEntity, targetLane: Lane) => {
			return userEntity.id + ' moves.';
		}
	},
	'ULTRA_HYPER_KILLER': {
		id: 'ULTRA_HYPER_KILLER',
		active: true,
		faction: Faction.NONE,
		name: 'Ultra Hyper Killer',
		desc: 'Ultimate attack. Deals 1000 damage. For testing only!',
		keywords: [],
		target: {
			what: TargetWhat.ENTITY,
			range: TargetRange.ANY
		},
		fn: (match: Match, userEntity: Entity, target: Entity) => {
			var results: IEventResult[]  = [];

			results = results.concat(simpleAttack(match, userEntity, target, [], () => 1000));
			
			return {results: results};
		},
		resultMessage: (userEntity, target: Entity) => {
			return userEntity.id + ' uses the ULTRA HYPER KILLER!!';
		}
	},
	'FLANK_ASSAULT': {
		id: 'FLANK_ASSAULT',
		active: true,
		faction: Faction.FERALIST,
		name: 'Flank Assault',
		desc: `Move to a nearby lane, then attack a random enemy in that lane.`,
		keywords: [],
		target: {
			what: TargetWhat.LANE,
			range: TargetRange.NEARBY
		},
		fn: (match: Match, user: Entity, targetLane: Lane) => {
			var results: IEventResult[]  = [];

			// TODO movement

			var targetEntity = targetLane.getRandomEntity(otherTeam(user.team));
			if(targetEntity) {
				results = results.concat(simpleAttack(match, user, targetEntity));
			}
			
			return {results: results};
		}
	},
	'CHOOSE_RESPAWN_LANE': {
		id: 'CHOOSE_RESPAWN_LANE',
		active: true,
		faction: Faction.NONE,
		name: 'Choose Respawn Lane',
		desc: 'You respawn next turn. Choose your respawn location.',
		keywords: [],
		target: {
			what: TargetWhat.LANE,
			range: TargetRange.ANY,
		},
		fn: (match: Match, user: Entity, targetLane: Lane) => {
			// TODO
			return undefined;
		}
	}
};


function simpleAttack(match: Match, attacker: Entity, target: Entity, stefs?: IStefInstance[], damageMod?: (attacker?: Entity, target?: Entity)=>number): IEventResult[] {
	var results: IEventResult[] = [];

	var damage;
	var str = attacker.curStr;
	if(damageMod) {
		damage = damageMod(attacker, target);
	} else {
		damage = str;
	}

	// TODO off-lane penalty

	// TODO armor

	results = results.concat(match.changeEntityHp(target, damage * -1));

	if(target.alive && stefs) {
		stefs.forEach((stef) => {
			results = results.concat(match.applyStef(target, stef.stefId, stef.duration, attacker));
		});
	}

	return results;
}