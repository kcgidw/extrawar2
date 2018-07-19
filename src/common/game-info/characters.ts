import { Faction, IEntityProfile } from "../game-core/common";

export const Characters: {[key: string]: IEntityProfile} = {
	UNKNOWN: {
		id: 'UNKNOWN',
		faction: undefined,
		name: 'UNKNOWN',
		maxHp: undefined,
		str: undefined,
		image: '',
		emptyProfile: true,
	},
	GENERIC_FER: {
		id: 'GENERIC_FER',
		faction: Faction.FERALIST,
		name: 'Generic Feralist',
		maxHp: 140,
		str: 20,
		image: 'feralist.png',
	},
	GENERIC_MOL: {
		id: 'GENERIC_MOL',
		faction: Faction.MOLTEN,
		name: 'Generic Molten',
		maxHp: 160,
		str: 20,
		image: 'molten.png',
	},
	GENERIC_ABE: {
		id: 'GENERIC_ABE',
		faction: Faction.ABERRANT,
		name: 'Generic Aberrant',
		maxHp: 175,
		str: 18,
		image: 'aberrant.png',
	},
	GENERIC_KIN: {
		id: 'GENERIC_KIN',
		faction: Faction.KINDRED,
		name: 'Generic Kindred',
		maxHp: 180,
		str: 18,
		image: 'kindred.png',
	},
	GENERIC_ETH: {
		id: 'GENERIC_ETH',
		faction: Faction.ETHER,
		name: 'Generic Ether',
		maxHp: 130,
		str: 20,
		image: 'ether.png',
	},
	GENERIC_GLO: {
		id: 'GENERIC_GLO',
		faction: Faction.GLOOMER,
		name: 'Generic Gloomer',
		maxHp: 140,
		str: 18,
		image: 'gloomer.png',
	},
	GENERIC_NONE: {
		id: 'GENERIC_NONE',
		faction: Faction.NONE,
		name: 'Neutralbot',
		maxHp: 160,
		str: 20,
		image: '',
		emptyProfile: true,
	},
};

export const PlayableCharacters: {[key: string]: IEntityProfile} = {
	GENERIC_FER: Characters.GENERIC_FER,
	GENERIC_MOL: Characters.GENERIC_MOL,
	GENERIC_ABE: Characters.GENERIC_ABE,
	GENERIC_KIN: Characters.GENERIC_KIN,
	GENERIC_ETH: Characters.GENERIC_ETH,
	GENERIC_GLO: Characters.GENERIC_GLO,
};