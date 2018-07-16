import { Faction, IStefInstance, ITargetInfo, TargetRange, TargetWhat, Team } from "../game-core/common";
import { Entity } from "../game-core/entity";
import { IEventCause, IEventResult } from "../game-core/event-interfaces";
import { Lane } from "../game-core/match";

export interface ISkillDef {
	id: string;
	active: boolean; // active vs passive
	faction: Faction;
	name: string;
	desc: string;
	keywords: string[]; // supplementary descriptons for stefs and whatnot
	target: ITargetInfo;
	fn: (user: Entity, target: Entity|Entity[]|Lane, custom?: object)=>Partial<IEventCause>;
	resultMessage?: (user: Entity, target?: Entity|Entity[]|Lane, custom?: object)=>string;
}

export const skills: {[key: string]: ISkillDef} = {
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
		fn: (user, targetEntity: Entity) => {
			var results: IEventResult[]  = [];
			results = results.concat(simpleAttack(user, targetEntity));
			return {results: results};
		},
		resultMessage: (user, targetEntity: Entity) => {
			return user.username + ' attacks.';
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
		fn: (user, targetLane: Lane) => {
			var results: IEventResult[]  = [];

			// TODO movement

			var targetEntity = targetLane.getRandomEntity(otherTeam(user.team));
			if(targetEntity) {
				results = results.concat(simpleAttack(user, targetEntity));
			}
			
			return {results: results};
		}
	}
};


function simpleAttack(attacker: Entity, target: Entity, stefs?: IStefInstance[], damageMod?: (attacker?: Entity, target?: Entity)=>number): IEventResult[] {
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

	results = results.concat(target.changeHp(damage));

	if(target.alive && stefs) {
		stefs.forEach((stef) => {
			results = results.concat(target.applyStef(stef.stefId, stef.invokerId, attacker));
		});
	}

	return results;
}

function otherTeam(x: Team): Team {
	if(x === 1) {return 2;}
	if(x === 2) {return 1;}
	throw new Error('bad team');
}