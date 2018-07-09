import { ISkillDef, Faction, ITargetWhat, ITargetRange } from "../game-core/rule-interfaces";
import { Entity } from "../game-core/entity";
import { ITurnEventResult } from "../game-core/event-interfaces";

export const skills: ISkillDef[] = [
	{
		active: true,
		faction: Faction.FERALIST,
		name: 'Flank Assault',
		desc: '',
		keywords: [],
		target: {
			what: ITargetWhat.LANE,
			range: ITargetRange.NEARBY
		},
		fn: (user, target: Entity) => {
			var results: ITurnEventResult[]  = [];
			return {
				entityId: user.entityId,
				actionId: 0,
				target: target.entityId,
				results: results
			};
		}
	}
];