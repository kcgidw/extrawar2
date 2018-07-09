import { IEntityProfile, Faction } from "../game-core/rule-interfaces";

export const chars: IEntityProfile[] = [
	{
		faction: Faction.FERALIST,
		name: 'Generic Feralist',
		maxHp: 80,
		str: 10
	},
	{
		faction: Faction.MOLTEN,
		name: 'Generic Molten',
		maxHp: 80,
		str: 10
	},
	{
		faction: Faction.ABERRANT,
		name: 'Generic Aberrant',
		maxHp: 80,
		str: 10
	},
	{
		faction: Faction.ETHER,
		name: 'Generic Ether',
		maxHp: 80,
		str: 10
	},
	{
		faction: Faction.KINDRED,
		name: 'Generic Kindred',
		maxHp: 80,
		str: 10
	},
	{
		faction: Faction.GLOOMER,
		name: 'Generic Gloomer',
		maxHp: 80,
		str: 10
	},
	{
		faction: Faction.NONE,
		name: 'Neutralbot',
		maxHp: 80,
		str: 12
	},
]