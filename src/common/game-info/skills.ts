import { Faction, IStefInstance, ITargetInfo, TargetRange, TargetWhat, Team, Lane } from "../game-core/common";
import { Entity } from "../game-core/entity";
import { IEventCause, IEventResult } from "../game-core/event-interfaces";
import { Match } from "../../server/chat-room/match";
import { randItem } from "../../server/lobby/util";
import { otherTeam, findEntities, usernameShouldAct } from "../match-util";
import { maxUsernameLength } from "../validate";
import { ALL_STEFS } from "./stefs";

export interface ISkillDef {
	id: string;
	active: boolean; // active vs passive
	faction: Faction;
	name: string;
	desc: string;
	keywords: string[]; // supplementary descriptons for stefs and whatnot
	apCost: number;
	cooldown: number;
	target: ITargetInfo;
	fn: (match: Match, userEntity: Entity, target: Entity|Lane, custom?: object)=>Partial<IEventCause>;
	resultMessage?: (userEntity: Entity, target?: Entity|Lane, custom?: object)=>string;
}

export interface ISkillInstance {
	skillDefId: string;
	turnUsed: number;
	cooldown: number;
}

function generateSkillDef(id: string, active: boolean, faction: Faction, name: string, desc: string,
	keywords: string[], apCost: number, cooldown: number, target: ITargetInfo,
	fn: (match: Match, userEntity: Entity, target: Entity|Lane|ISkillInstance, custom?: object)=>Partial<IEventCause>,
	resultMessage?: (userEntity: Entity, target?: Entity|Lane, custom?: object)=>string): ISkillDef {
		return {
			id, active, faction, name, desc, keywords, apCost, cooldown, target, fn, resultMessage
		};
}

export const Skills: {[key: string]: ISkillDef} = {
	'ATTACK': {
		id: 'ATTACK',
		active: true,
		faction: Faction.NONE,
		name: 'Attack',
		desc: 'Attack a nearby enemy.',
		keywords: [],
		apCost: 0,
		cooldown: 0,
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
		apCost: 0,
		cooldown: 0,
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
		desc: 'Deal 1000 damage!',
		keywords: [],
		apCost: 0,
		cooldown: 0,
		target: {
			what: TargetWhat.ENTITY,
			range: TargetRange.ANY
		},
		fn: (match: Match, userEntity: Entity, target: Entity) => {
			var results: IEventResult[]  = [];

			results = results.concat(simpleAttack(match, userEntity, target, {
				damageMod: (attacker) => (1000),
			}));
			
			return {results: results};
		},
		resultMessage: (userEntity, target: Entity) => {
			return userEntity.id + ' uses the ULTRA HYPER KILLER!!';
		}
	},
	'ACCEL': generateSkillDef('ACCEL', true, Faction.NONE, 'Accelerate', '', [], undefined, undefined,
		{ what: TargetWhat.NONE, range: undefined },
		function fn(match, user, targetSkill: ISkillInstance) {
			var results: IEventResult[]  = [];
			results = results.concat(match.accelerate(user, targetSkill));
			return {results: results};
		},
		function resultMessage(user) {
			return `${user.id} accelerates.`;
		}
	),
	'TURN_END': generateSkillDef('TURN_END', false, Faction.NONE, 'Turn Ending', '', [], undefined, undefined, 
		{ what: TargetWhat.NONE, range: undefined }, undefined,
		() => ('The turn is ending.')
	),
	'NO_HOLDS': generateSkillDef('NO_HOLDS', false, Faction.FERALIST, 'No Holds Barred',
		'Deal +20% attack damage to in-lane enemies.', [], 4, undefined, undefined, undefined
	),
	'FLANK_ASSAULT': {
		id: 'FLANK_ASSAULT',
		active: true,
		faction: Faction.FERALIST,
		name: 'Flank Assault',
		desc: `Move to a nearby lane, then attack a random enemy in that lane.`,
		keywords: [],
		apCost: 5,
		cooldown: 5,
		target: {
			what: TargetWhat.LANE,
			range: TargetRange.NEARBY
		},
		fn: (match: Match, user: Entity, targetLane: Lane) => {
			var results: IEventResult[]  = [];

			results = results.concat(match.moveEntity(user, targetLane, 1));

			var targetEntity = randItem(findEntities(match, {laneId: targetLane.y, team: otherTeam(user.team), aliveOnly: true}));
			if(targetEntity) {
				results = results.concat(simpleAttack(match, user, targetEntity));
			}
			
			return {results: results};
		}
	},
	'ADRENALINE_RUSH': {
		id: 'ADRENALINE_RUSH',
		active: true,
		faction: Faction.FERALIST,
		name: 'Adrenaline Rush',
		desc: `Attack 3 times to random enemies in-lane.`,
		keywords: [],
		apCost: 6,
		cooldown: 6,
		target: {
			what: TargetWhat.LANE,
			range: TargetRange.IN_LANE
		},
		fn: (match: Match, user: Entity, targetLane: Lane) => {
			var results: IEventResult[]  = [];

			for(let i=0; i<3; i++) {
				var targetEntity = randItem(findEntities(match, {laneId: targetLane.y, team: otherTeam(user.team)}));
				if(targetEntity) {
					results = results.concat(simpleAttack(match, user, targetEntity));
				}
			}
			
			return {results: results};
		}
	},
	'BRUTE': generateSkillDef('BRUTE', true, Faction.FERALIST, 'Brute Rage',
		'Gain Strength Up (4) and Panic (2).', ['STR_UP', 'PANIC'], 5, 5, {what: TargetWhat.SELF, range: TargetRange.IN_LANE},
		function fn (match: Match, user: Entity, target: Entity) {
			var results: IEventResult[]  = [];
			results = results.concat(
				match.applyStefToEntity(target, ALL_STEFS.STR_UP.id, 4, user),
				match.applyStefToEntity(target, ALL_STEFS.PANIC.id, 2, user)
			);
			return {results: results};
		}
	),
	'IMMORTAL_FURY': generateSkillDef('IMMORTAL_FURY', false, Faction.MOLTEN, 'Immortal Fury',
		'When you respawn, gain Armor (3) and Strength Up (3).', [], 5, undefined, undefined, undefined
	),
	'AGNI_BURST': {
		id: 'AGNI_BURST',
		active: true,
		faction: Faction.MOLTEN,
		name: 'Agni Burst',
		desc: `Attack all nearby enemies. Take 10 damage.`,
		keywords: [],
		apCost: 5,
		cooldown: 5,
		target: {
			what: TargetWhat.NONE,
			range: TargetRange.NEARBY
		},
		fn: (match: Match, user: Entity, target: Entity) => {
			var results: IEventResult[]  = [];
			var tars = findEntities(match, {
				laneId: user.state.y,
				laneRange: 1,
				team: otherTeam(user.team),
			});
			tars.forEach((ent) => {
				results = results.concat(simpleAttack(match, user, ent, {
					damageMod: (attacker) => (user.profile.str * 1.20)
				}));
			});
			results = results.concat(match.changeEntityHp(user, -10));
			return {results: results};
		}
	},
	'PHLOGISTON': {
		id: 'PHLOGISTON',
		active: true,
		faction: Faction.MOLTEN,
		name: 'Phlogistic Fusion',
		desc: `Gain Volatile (1).`,
		keywords: ['VOLATILE'],
		apCost: 3,
		cooldown: 3,
		target: {
			what: TargetWhat.SELF,
			range: TargetRange.IN_LANE
		},
		fn: (match: Match, user: Entity, target: Entity) => {
			var results: IEventResult[]  = [];
			results = results.concat(match.applyStefToEntity(user, 'VOLATILE', 1, user));
			return {results: results};
		}
	},
	'EULOGY': generateSkillDef('EULOGY', false, Faction.ABERRANT, 'Eulogy', 
		'When you die, apply Strength Up (X) to allies, where X = your respawn counter + 1.',
		['STR_UP'], 3, undefined, undefined, undefined
	),
	'EQUIV_EX': {
		id: 'EQUIV_EX',
		active: true,
		faction: Faction.ABERRANT,
		name: 'Equivalent Exchange',
		desc: 'Heal a nearby ally 50 HP. Lose 50 HP.',
		keywords: [],
		apCost: 4,
		cooldown: 4,
		target: {
			what: TargetWhat.ALLY,
			range: TargetRange.NEARBY
		},
		fn: (match: Match, user: Entity, target: Entity) => {
			var results: IEventResult[]  = [];
			results = results.concat(match.changeEntityHp(target, 50));
			results = results.concat(match.changeEntityHp(user, -50));
			return {results: results};
		}
	},
	'STAIN': generateSkillDef('STAIN', true, Faction.ABERRANT,
		'Stain',
		'Attack a nearby enemy and apply Poison (5).',
		['POISON'], 6, 6,
		{what: TargetWhat.ENEMY, range: TargetRange.NEARBY},
		function fn(match: Match, user: Entity, target: Entity) {
			var results: IEventResult[]  = [];
			results = results.concat(simpleAttack(match, user, target, {
				stefs: [{
					stefId: ALL_STEFS.POISON.id,
					duration: 5,
					invokerEntityId: user.id,
					invokedTurn: match.turn,
				}],
			}));
			return {results: results};
		}
	),
	'INVIGORATION': generateSkillDef('INVIGORATION', false, Faction.KINDRED, 'Invigoration',
		'When you accelerate, recover 10 HP.', [], undefined, undefined, undefined, undefined
	),
	'PHOTO': generateSkillDef('PHOTO', true, Faction.KINDRED, 'Photosynthesis',
		'Apply Rejuvenation (4) to a nearby lane.', ['REJUV'], 6, 6, {what: TargetWhat.LANE, range: TargetRange.NEARBY},
		function fn(match, user, targetLane: Lane) {
			var results: IEventResult[]  = [];
			results = results.concat(match.applyStefToLane(targetLane, user.team, 'REJUV', 4, user));
			return {results: results};
		}
	),
	'VITAL_BURST': generateSkillDef('VITAL_BURST', true, Faction.KINDRED, 'Vital Burst',
		'Attack a nearby enemy and apply Strength Down (3).', ['STR_DOWN'], 6, 6, {what: TargetWhat.ENEMY, range: TargetRange.NEARBY},
		function fn(match, user, target: Entity) {
			var results: IEventResult[]  = [];
			results = results.concat(simpleAttack(match, user, target, {
				stefs: [{
					stefId: 'STR_DOWN',
					duration: 3,
					invokerEntityId: user.id,
					invokedTurn: match.turn,
				}]
			}));
			return {results: results};
		}
	),
	// 'CHOOSE_RESPAWN_LANE': {
	// 	id: 'CHOOSE_RESPAWN_LANE',
	// 	active: true,
	// 	faction: Faction.NONE,
	// 	name: 'Choose Respawn Lane',
	// 	desc: 'You respawn next turn. Choose your respawn location.',
	// 	keywords: [],
	// 	target: {
	// 		what: TargetWhat.LANE,
	// 		range: TargetRange.ANY,
	// 	},
	// 	fn: (match: Match, user: Entity, targetLane: Lane) => {
	// 		// TODO
	// 		return undefined;
	// 	}
	// }
};

interface ISimpleAttackOptions {
	stefs?: IStefInstance[];
	damageMod?: (attacker?: Entity, target?: Entity)=>number;
	selfDamage?: (attacker?: Entity)=>number;
	ignoreLanePenalty?: boolean;
}
function simpleAttack(match: Match, attacker: Entity, target: Entity, options: ISimpleAttackOptions = {}) {
	var results: IEventResult[] = [];

	var damage;
	var str = attacker.curStr;

	if(options.damageMod) {
		damage = options.damageMod(attacker, target);
	} else {
		damage = str;
	}

	if(target.state.y === attacker.state.y && attacker.hasPassive('NO_HOLDS')) {
		damage *= 1.20;
	}
	if(target.state.y !== attacker.state.y && !options.ignoreLanePenalty) {
		// off-lane penalty
		damage -= damage * 0.30;
	}
	if(target.getStef(ALL_STEFS.ARMOR)) {
		damage -= damage * 0.25;
	}

	results = results.concat(match.changeEntityHp(target, damage * -1));

	if(target.alive && options.stefs) {
		options.stefs.forEach((stef) => {
			results = results.concat(match.applyStefToEntity(target, stef.stefId, stef.duration, attacker));
		});
	}

	if(options.selfDamage) { // also for lifesteal!
		let sd = options.selfDamage(attacker);
		if(sd !== 0) {
			results = results.concat(match.changeEntityHp(attacker, sd * -1));
		}
	}

	return results;
}