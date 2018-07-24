import { User } from "../../server/lobby/user";
import { Characters } from "../game-info/characters";
import { ALL_STEFS } from "../game-info/stefs";
import { IEntityProfile, IEntityState, IStefDef, IStefInstance, Team, Faction } from "./common";
import { ISkillDef, ISkillInstance } from "../game-info/skills";

export class Entity {
	isPlayer: boolean;
	id: string;
	displayName: string;
	profileId: string;
	state: IEntityState;
	team: Team;

	get username(): string {
		return this.id;
	}
	get profile(): IEntityProfile {
		return Characters[this.profileId];
	}

	constructor(user: User, team: Team, character: IEntityProfile) {
		this.id = user.username;
		this.isPlayer = user !== undefined;
		this.profileId = character.id;

		this.team = team;

		var actives: string[] = ['ATTACK', 'MOVE', 'ULTRA_HYPER_KILLER'];
		if(character.faction === Faction.FERALIST) {
			actives = [... actives, 'FLANK_ASSAULT', 'ADRENALINE_RUSH', ''];
		}
		var activeInstances: ISkillInstance[] = actives.map((id) => ({skillDefId: id, cooldown: 0}));

		this.state = {
			entityId: this.id,
			ready: false,
			hp: this.profile.maxHp,
			maxHp: this.profile.maxHp,
			ap: 0,
			maxAp: 9,
			deaths: 0,
			respawn: 0,
			nextRespawn: 1,
			diedTurn: undefined,
			passiveSlots: 1,
			activeSlots: 1,
			passiveIds: [],
			actives: activeInstances,
			stefs: [],
			y: 0,
		};
	}

	get curStr() {
		var str = this.profile.str;
		if(this.hasStef(ALL_STEFS.STR_UP)) {
			str += str * 1.25;
		}
		return Math.ceil(str);
	}
	get alive() {
		return this.state.hp > 0;
	}

	hasStef(stef: IStefDef|string): IStefInstance {
		var stefId = stef instanceof Object ? (<IStefDef>stef).id : stef;
		return this.state.stefs.find((se) => se.stefId === stefId);
	}
}
