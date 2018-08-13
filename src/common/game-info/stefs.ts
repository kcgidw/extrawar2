import { IStefDef } from "../game-core/common";

export const MAX_STEF_DURATION = 8;

export const ALL_STEFS: {[key: string]: IStefDef} = {
	'STR_UP': {
		id: 'STR_UP',
		name: 'Strength Up',
		desc: 'Strength +30%.',
		isBeneficial: true
	},
	'STR_DOWN': {
		id: 'STR_DOWN',
		name: 'Strength Down',
		desc: 'Strength -30%.',
		isBeneficial: false
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
	'REJUV': {
		id: 'REJUV',
		name: 'Rejuvenation',
		desc: 'Recover 10 HP each cycle.',
		isBeneficial: true,
	},
	'PANIC': {
		id: 'PANIC',
		name: 'Panic',
		desc: 'Cannot use skills.',
		isBeneficial: false,
	},
};