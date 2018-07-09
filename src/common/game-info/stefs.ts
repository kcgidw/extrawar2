import { IStefDef } from "../game-core/rule-interfaces";

export const MAX_STEF_DURATION = 8;

export const ALL_STEFS: {[key: string]: IStefDef} = {
	'STR_UP': {
		id: 'STR_UP',
		name: 'Strength Up',
		desc: 'Attack damage +30%.',
		isBeneficial: true
	}
};