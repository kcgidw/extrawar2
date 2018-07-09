import { User } from "../../server/lobby/user";
import { IEntityState } from "./instance-interfaces";
import { IEntityProfile } from "./rule-interfaces";
import { ITurnEventResult, TurnEventResultType, INoneResult, IHpChangeResult, IDeathResult, ITurnEventCause } from "./event-interfaces";

export class Entity {
	entityId: number;
	owner: User;
	username: string;
	profile: IEntityProfile;
	state: IEntityState;
	team: 1|2;

	constructor(user: User, character: IEntityProfile) {
		this.owner = user;
		this.username = user.username;
		this.profile = character;

		this.state = {
			entityId: this.entityId,
			hp: this.profile.maxHp,
			ap: 0,
			deaths: 0,
			respawn: 1,
			passiveSlots: 1,
			activeSlots: 1,
			passives: [],
			actives: [],
			stefs: [],
			y: 0,
		};
	}

	isPlayer(): boolean {
		return this.owner !== undefined;
	}

	changeHp(cause: ITurnEventCause, x: number, custom?: object) {
		var results = cause.results;

		if(this.state.hp <= 0) {
			results.push(<INoneResult>{
				type: TurnEventResultType.NONE,
				reason: 'Entity already dead'
			});
		} else {
			var damage = x;

			// TODO damage calcs

			this.state.hp += damage;
			results.push(<IHpChangeResult>{
				type: TurnEventResultType.HP_CHANGE,
				entityId: this.entityId,
				value: x
			});

			if(this.state.hp === 0) {
				results.push(<IDeathResult>{
					type: TurnEventResultType.DEATH,
					entityId: this.entityId
				});
			}
		}
	}
}
