import { IStefDef } from "../game-core/common";

export const MAX_STEF_DURATION = 8;

export const ALL_STEFS: {[key: string]: IStefDef} = {
	'STR_UP': {
		id: 'STR_UP',
		name: 'Strength Up',
		desc: 'Strength +30%.',
		isBeneficial: true
	},
	'VOLATILE': {
		id: 'VOLATILE',
		name: 'Volatile',
		desc: 'Strength +75%.',
		isBeneficial: true
	},
	'ARMOR': {
		id: 'ARMOR',
		name: 'Armor',
		desc: 'Take -25% attack damage.',
		isBeneficial: true
	},
	'POISON': {
		id: 'POISON',
		name: 'Poison',
		desc: 'Take 10 damage each cycle.',
		isBeneficial: false,
	},
};