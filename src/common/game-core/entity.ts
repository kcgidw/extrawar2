import { User } from "../../server/lobby/user";
import { IEntityState, IStefInstance, Team } from "./instance-interfaces";
import { IEntityProfile, IStefDef } from "./rule-interfaces";
import { IEventResult, TurnEventResultType, INoneResult, IHpChangeResult, IDeathResult, IEventCause } from "./event-interfaces";
import { ALL_STEFS, MAX_STEF_DURATION } from "../game-info/stefs";

export class Entity {
	entityId: number;
	owner: User;
	username: string;
	profile: IEntityProfile;
	state: IEntityState;
	team: Team;

	constructor(user: User, team: Team, character: IEntityProfile) {
		this.owner = user;
		this.username = user.username;
		this.profile = character;

		this.team = team;

		this.state = {
			entityId: this.entityId,
			ready: false,
			hp: this.profile.maxHp,
			maxHp: this.profile.maxHp,
			ap: 0,
			deaths: 0,
			respawn: 0,
			nextRespawn: 1,
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

	changeHp(change: number, custom?: object): IEventResult[] {
		var results: IEventResult[] = [];

		if(!this.alive) {
			results.push(<INoneResult>{
				type: TurnEventResultType.NONE,
				reason: 'Entity already dead'
			});
		} else {

			this.state.hp += change;
			results.push(<IHpChangeResult>{
				type: TurnEventResultType.HP_CHANGE,
				entityId: this.entityId,
				value: change
			});

			if(!this.alive) {
				results = results.concat(this.onDeath());
			}
		}

		return results;
	}

	applyStef(stefId: string, duration: number, invoker: Entity): IEventResult[] {
		var results: IEventResult[] = [];

		if(!this.alive) {
			results.push(<INoneResult>{
				type: TurnEventResultType.NONE,
				reason: 'Entity already dead'
			});
		} else {
			var stef: IStefInstance = this.hasStef(stefId);
			if(stef) {
				stef.duration += duration;
				if(stef.duration > MAX_STEF_DURATION) {
					stef.duration = MAX_STEF_DURATION;
				}
				stef.invokerId = invoker.entityId; // override invoker
			} else {
				stef = {
					stefId: stefId,
					duration: duration,
					invokerId: invoker.entityId
				};
			}
		}
		return results;
	}

	onDeath(): IEventResult[] {
		var results: IEventResult[] = [];
		results.push(<IDeathResult>{
			type: TurnEventResultType.DEATH,
			entityId: this.entityId
		});
		return results;
	}
}
