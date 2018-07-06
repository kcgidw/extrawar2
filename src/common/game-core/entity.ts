import { User } from "../../server/lobby/user";
import { IEntityProfile } from "./rule-interfaces";
import { IEntityState } from "./instance-interfaces";

export class Entity {
	entityId: number;
	owner: User;
	username: string;
	profile: IEntityProfile;
	state: IEntityState;

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
		};
	}

	isPlayer(): boolean {
		return this.owner !== undefined;
	}
}
