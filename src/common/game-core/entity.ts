import { User } from "../../server/lobby/user";
import { Characters } from "../game-info/characters";
import { ALL_STEFS } from "../game-info/stefs";
import { IEntityProfile, IEntityState, IStefDef, IStefInstance, Team, Faction } from "./common";
import { ISkillDef, ISkillInstance, Skills } from "../game-info/skills";

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
		actives = actives.concat(Object.keys(Skills).filter((skId) => (Skills[skId].faction === character.faction && Skills[skId].active === true)));
		if(this.profile.emptyProfile) {
			actives = [];
		}
		var activeInstances: ISkillInstance[] = actives.map((id) => ({
			skillDefId: id,
			turnUsed: undefined,
			cooldown: Skills[id].cooldown
		}));

		var passives = Object.keys(Skills).filter((sk) => {
			var def = Skills[sk];
			return def.active === false && def.faction === this.profile.faction;
		});

		this.state = {
			entityId: this.id,
			ready: false,
			hp: this.profile.maxHp,
			maxHp: this.profile.maxHp,
			ap: 0,
			maxAp: 9,
			deaths: 0,
			respawn: 0,
			nextRespawn: 2,
			diedTurn: undefined,
			passiveSlots: 1,
			activeSlots: 1,
			passiveIds: passives,
			actives: activeInstances,
			stefs: [],
			y: 0,
		};
	}

	get curStr() {
		var baseStr = this.profile.str;
		var str = baseStr;
		if(this.getStef(ALL_STEFS.STR_UP)) {
			str += baseStr * 0.30;
		}
		if(this.getStef(ALL_STEFS.VOLATILE)) {
			str += baseStr * 0.75;
		}
		return Math.ceil(str);
	}
	get alive() {
		return this.state.hp > 0;
	}

	getStef(stef: IStefDef|string): IStefInstance {
		var stefId = stef instanceof Object ? (<IStefDef>stef).id : stef;
		return this.state.stefs.find((se) => se.stefId === stefId);
	}

	loseStef(stefId: string) {
		var stefIdx = this.state.stefs.findIndex((cur) => (cur.stefId === stefId));
		if(stefIdx !== -1) {
			this.state.stefs.splice(stefIdx, 1);
		}
	}

	hasPassive(id: string): boolean {
		return this.state.passiveIds.indexOf(id) > -1;
	}

	resetCooldown(actionId: string) {
		var def = Skills[actionId];
		var inst = this.state.actives.find((curInst) => (curInst.skillDefId === actionId));
		inst.cooldown = def.cooldown;
	}
}
