import { IMatchState, IStefInstance, Lane, Phase, TargetWhat, Team } from "../../common/game-core/common";
import { Entity } from "../../common/game-core/entity";
import { IActionResolutionTimeline, IChangeLangeResult, IDeathResult, IEventCause, IEventResult, IGainStefResult, IGameOverResult, IHpChangeResult, INoneResult, TurnEventResultType, IRespawnResult, IAccelResult } from "../../common/game-core/event-interfaces";
import { Characters, PlayableCharacters } from "../../common/game-info/characters";
import { Skills, ISkillInstance } from "../../common/game-info/skills";
import { MAX_STEF_DURATION, ALL_STEFS } from "../../common/game-info/stefs";
import { IPlayerDecisionRequest, IPromptDecisionMessage, SOCKET_MSG } from "../../common/messages";
import { User } from "../lobby/user";
import { shuffle } from "../lobby/util";
import { ChatRoom } from "./chat-room";
import * as _ from 'lodash';
import { getActingTeam, otherTeam, getUsernameTeam, userShouldAct, teamDead, findEntities } from "../../common/match-util";

const MAX_PLAYERS = 6; // TODO: any more = spectators. Make sure to update the const in lobby.ts too
const NEXT_PHASE_DELAY = 0.4 * 1000;
const NUM_LANES = 5;

export class Match implements IMatchState {
	room: ChatRoom;
	players: {[username: string]: Entity} = {};
	team1: string[] = [];
	team2: string[] = [];
	turn: number = -1;
	phase: Phase;
	lanes: Lane[] = [];

	playersReady;
	
	characterChoicesIds: {[key: string]: string[]} = {};
	playerDecisions: {[key: string]: IPlayerDecisionRequest} = {};

	gameOver: boolean = false;

	debugEnableRoster: boolean;
	debugEnableSkills: boolean;

	constructor(room: ChatRoom) {
		this.debugEnableRoster = process.env.DEBUG === 'true';
		this.debugEnableSkills = process.env.DEBUG === 'true';

		this.room = room;
		this.lanes = [];
		for(let i=0; i<NUM_LANES; i++) {
			this.lanes.push(new Lane(i));
		}

		// set teams
		var team: Team;
		var char: Entity;
		room.users.forEach((usr: User, idx: number) => {
			if(idx < room.users.length / 2) {
				team = 1;
				this.team1.push(usr.username);
			} else {
				team = 2;
				this.team2.push(usr.username);
			}
			char = new Entity(usr, team, Characters.UNKNOWN);
			this.players[usr.username] = char;
		});

		this.setCharacterChoices();
	}

	enqueuePlayerDecision(user: User, decision: IPlayerDecisionRequest) {
		switch(this.phase) {
			case(Phase.CHOOSE_CHARACTER):
				this.playerDecisions[user.username] = decision;
				if(this.allPlayersReady()) {
					this.resolveDecisionsChooseCharacter();
				}
				break;
			case(Phase.CHOOSE_STARTING_LANE):
				this.playerDecisions[user.username] = decision;
				if(this.allPlayersReady()) {
					this.resolveDecisionsChooseStartingLane();
				}
				break;
			case(Phase.PLAN):
				let player = this.players[user.username];
				if(player.team === getActingTeam(this.snapshot()) && player.alive) {
					this.playerDecisions[user.username] = decision;
					if(this.allPlayersReady()) {
						this.resolveDecisionsChooseAction();
					}
				}
				break;
			case(Phase.RESOLVE):
				this.playerDecisions[user.username] = {
					username: user.username,
					phase: Phase.RESOLVE,
				};
				if(this.allPlayersReady()) {
					this.nextPhase(Phase.PLAN);
				}
				break;
			case(Phase.GAME_OVER):
				break;
			default:
				throw new Error('bad phase ' + this.phase);
		}
	}

	resolveDecisionsChooseCharacter() {
		for(let username of Object.keys(this.playerDecisions)) {
			let choice = this.playerDecisions[username];
			let entProfile = Characters[choice.entityProfileId];
			let ent = new Entity(this.room.findUser(username), getUsernameTeam(this, username), entProfile);
			this.players[username] = ent;
			
			if(this.debugEnableSkills) {
				ent.state.actives.forEach((a) => {
					a.cooldown = 0;
				});
			}
		}

		setTimeout(() => {
			this.nextPhase(Phase.CHOOSE_STARTING_LANE);
		}, NEXT_PHASE_DELAY);
	}
	resolveDecisionsChooseStartingLane() {
		for(let username of Object.keys(this.playerDecisions)) {
			let choice = this.playerDecisions[username];
			this.players[username].state.y = choice.startingLane;
		}
		
		setTimeout(() => {
			this.nextPhase(Phase.PLAN);
		}, NEXT_PHASE_DELAY);
	}
	resolveDecisionsChooseAction() {
		setTimeout(() => {
			this.nextPhase(Phase.RESOLVE);
		},NEXT_PHASE_DELAY);
	}

	resetDecisions() {
		this.playerDecisions = {};
		if(this.characterChoicesIds) {
			this.characterChoicesIds = undefined;
		}
	}

	setCharacterChoices(): {[key: string]: string[]} {
		this.phase = Phase.CHOOSE_CHARACTER;
		this.characterChoicesIds = {};

		// TODO better character destribution?

		var charsShuffled: string[] = Object.keys(PlayableCharacters);
		shuffle(charsShuffled);

		var numChoices = this.debugEnableRoster ? 6 : 2;

		var idx = 0;
		var pcs = Object.keys(PlayableCharacters);
		shuffle(pcs);
		this.room.users.forEach((usr) => {
			var choices = [];
			for(let c=0; c<numChoices; c++) {
				choices.push(pcs[idx++]);
				idx %= pcs.length;
			}
			this.characterChoicesIds[usr.username] = choices;
		});

		return this.characterChoicesIds;
	}

	snapshot(): IMatchState {
		return {
			players: _.cloneDeep(this.players),
			team1: _.cloneDeep(this.team1),
			team2: _.cloneDeep(this.team2),
			turn: _.cloneDeep(this.turn),
			phase: _.cloneDeep(this.phase),
			lanes: _.cloneDeep(this.lanes),
			characterChoicesIds: _.cloneDeep(this.characterChoicesIds),
			playersReady: _.cloneDeep(this.getPlayersReady()),
		};
	}

	nextPhase(phase: Phase) {
		if(this.gameOver) {
			return;
		}
		this.phase = phase;
		switch(phase) {
			case(Phase.CHOOSE_STARTING_LANE):
				this.resetDecisions();
				this.room.users.forEach((user) => {
					var player = this.players[user.username];
					user.emit(SOCKET_MSG.PROMPT_DECISION, <IPromptDecisionMessage>{
						messageName: SOCKET_MSG.PROMPT_DECISION,
						phase: phase,
						matchState: this.snapshot(),
					});
				});
				break;
			case(Phase.PLAN):
				this.resetDecisions();
				if(this.turn <= 0) {
					this.turn = 1;
				} else {
					this.turn++;
				}
				this.room.users.forEach((user) => {
					var shouldAct = userShouldAct(this, user);
					if(!shouldAct) {
						this.playerDecisions[user.username] = {
							username: user.username,
							phase: this.phase,
						};
					}
				});
				this.room.users.forEach((user) => {
					var shouldAct = userShouldAct(this, user);
					var ent = this.players[user.username];
					user.emit(SOCKET_MSG.PROMPT_DECISION, <IPromptDecisionMessage>{
						messageName: SOCKET_MSG.PROMPT_DECISION,
						phase: phase,
						matchState: this.snapshot(),
						actionChoices: shouldAct ? ent.state.actives : [],
					});
				});
				if(this.allPlayersReady()) {
					setTimeout(() => {
						this.nextPhase(Phase.PLAN);
					}, NEXT_PHASE_DELAY);
				}
				break;
			case(Phase.RESOLVE):
				var causes = [];
				var playerDecisions = this.playerDecisions;
				var players = Object.keys(playerDecisions);
				this.resetDecisions();
				players.sort((usernameA: string, usernameB: string) => {
					var playerA = this.players[usernameA];
					var playerB = this.players[usernameB];
					var yDiff = playerA.state.y - playerB.state.y;
					if(yDiff !== 0) {
						return yDiff;
					}
					return 0; // TODO decide ties
				});
				players.forEach((username) => {
					var decision = playerDecisions[username];
					var actionDef = Skills[decision.actionId];
					var entity = this.players[username];
					if(actionDef && !this.gameOver) {
						console.log('Resolving decision...');
						console.log(decision);

						let target: Entity|Lane|ISkillInstance;
						if(actionDef.target.what === TargetWhat.LANE) {
							target = this.lanes[decision.targetLane];
						}
						if(actionDef.target.what === TargetWhat.ALLY || actionDef.target.what === TargetWhat.ENEMY || actionDef.target.what === TargetWhat.ENTITY) {
							target = this.players[decision.targetEntity];
						}
						if(actionDef.target.what === TargetWhat.SELF) {
							target = entity;
						}
						if(actionDef.id === 'ACCEL') {
							target = entity.state.actives.find((a) => (a.skillDefId === decision.targetSkill));
						} else {
							entity.state.actives.find((a) => (a.skillDefId === decision.actionId)).turnUsed = this.turn;
						}

						if(actionDef.cooldown > 0) {
							entity.resetCooldown(actionDef.id);
						}

						let res = actionDef.fn(this, entity, <any>target, {});
						let resObj: IEventCause = {
							entityId: (<IEventCause>res).entityId || username,
							actionDefId: (<IEventCause>res).actionDefId || actionDef.id,
							targetId: target ? ((<Entity>target).id || (<Lane>target).y || (<ISkillInstance>target).skillDefId) : undefined,
							results: res.results,
						};
						causes.push(resObj);
					}
				});

				if(!this.gameOver) {
					console.log(`turn ${this.turn} ending`);
					causes.push(this.turnEnding(players));
				}

				this.room.nsp.to(this.room.roomId).emit(SOCKET_MSG.RESOLVE_ACTIONS, <IActionResolutionTimeline>{
					causes: causes,
				});
				break;
			case(Phase.CHOOSE_CHARACTER):
				// for now, no-op. Leave the functionality to START_GAME
			default:
				throw new Error('bad phase ' + phase);
		}
	}

	/* Action enactments */

	changeEntityHp(ent: Entity, change: number, options?: object): IEventResult[] {
		var results: IEventResult[] = [];

		change = Math.ceil(change);

		if(!ent.alive) {
			results.push(<INoneResult>{
				type: TurnEventResultType.NONE,
				entityId: ent.id,
				reason: 'Entity already dead'
			});
		} else {
			ent.state.hp += change;
			if(ent.state.hp > ent.state.maxHp) {
				ent.state.hp = ent.state.maxHp;
			}

			results.push(<IHpChangeResult>{
				type: TurnEventResultType.HP_CHANGE,
				entityId: ent.username,
				value: change,
				newMatchState: this.snapshot(),
			});

			if(!ent.alive) {
				ent.state.hp = 0;
				results = results.concat(this.onDeath(ent));
			}
		}

		return results;
	}

	applyStefToEntity(ent: Entity, stefId: string, duration: number, invokerEntity: Entity): IEventResult[] {
		var results: IEventResult[] = [];

		if(!ent.alive) {
			results.push(<INoneResult>{
				type: TurnEventResultType.NONE,
				entityId: ent.id,
				reason: 'Entity already dead'
			});
		} else {
			this.applyStef(ent.state.stefs, stefId, duration, invokerEntity);

			results.push(<IGainStefResult>{
				type: TurnEventResultType.GAIN_STEF,
				entityId: ent.id,
				stefId: stefId,
				newMatchState: this.snapshot()
			});
		}
		return results;
	}

	applyStefToLane(lane: Lane, toSide:Team, stefId: string, duration: number, invokerEntity: Entity): IEventResult[] {
		var results: IEventResult[] = [];
		var stefs: IStefInstance[] = lane.getTeamStefs(toSide);

		this.applyStef(stefs, stefId, duration, invokerEntity);

		results.push(<IGainStefResult>{
			type: TurnEventResultType.GAIN_STEF,
			laneId: lane.y,
			stefId: stefId,
			newMatchState: this.snapshot()
		});
		return results;
	}
	applyStef(stefs: IStefInstance[], stefId: string, duration: number, invokerEntity: Entity) {
		var stef = (stefs.find((stefInst) => (stefInst.stefId === stefId)));
		if(stef) {
			stef.duration += duration;
			if(stef.duration > MAX_STEF_DURATION) {
				stef.duration = MAX_STEF_DURATION;
			}
			stef.invokerEntityId = invokerEntity.id; // override invoker
		} else {
			stef = {
				stefId: stefId,
				duration: duration,
				invokerEntityId: invokerEntity ? invokerEntity.id : undefined,
				invokedTurn: this.turn,
			};
			stefs.push(stef);
		}
	}

	moveEntity(ent: Entity, lane: Lane, range: number): IEventResult[] {
		if(Math.abs(ent.state.y - lane.y) <= range) {
			ent.state.y = lane.y;
		} else {
			return [<INoneResult>{
				type: TurnEventResultType.NONE,
				entityId: ent.id,
				reason: 'Lane out of range',
				newMatchState: this.snapshot()
			}];
		}
		return [<IChangeLangeResult>{
			type: TurnEventResultType.CHANGE_LANE,
			entityId: ent.id,
			laneId: lane.y,
			newMatchState: this.snapshot(),
		}];
	}

	onDeath(ent: Entity): IEventResult[] {
		var results: IEventResult[] = [];
		results.push(<IDeathResult>{
			type: TurnEventResultType.DEATH,
			entityId: ent.id,
			newMatchState: this.snapshot(),
		});

		ent.state.nextRespawn++;
		ent.state.diedTurn = this.turn;

		if(teamDead(this, ent.team)) {
			this.gameOver = true;
			results.push(<IGameOverResult> {
				type: TurnEventResultType.GAME_OVER,
				winner: otherTeam(ent.team),
				newMatchState: this.snapshot(),
			});
		}

		if(ent.hasPassive('EULOGY')) {
			var teammates = this.team1.filter((name) => (name !== ent.id));
			for(let allyName of teammates) {
				results = results.concat(this.applyStefToEntity(this.players[allyName], 'STR_UP', ent.state.respawn + 1, ent));
			}
		}
		
		return results;
	}

	respawn(ent: Entity): IEventResult[] {
		ent.state.maxHp = ent.profile.maxHp;
		ent.state.hp = ent.profile.maxHp;
		ent.state.diedTurn = undefined;
		ent.state.respawn = ent.state.nextRespawn;
		if(ent.hasPassive('IMMORTAL_FURY')) {
			this.applyStefToEntity(ent, 'ARMOR', 3, undefined);
			this.applyStefToEntity(ent, 'STR_UP', 3, undefined);
		}
		return [<IRespawnResult>{
			type: TurnEventResultType.RESPAWN,
			entityId: ent.id,
			newMatchState: this.snapshot(),
		}];
	}

	accelerate(ent: Entity, skInst: ISkillInstance): IEventResult[] {
		if(skInst === undefined || skInst.cooldown <= 1) {
			return [<INoneResult>{
				type: TurnEventResultType.NONE,
				entityId: ent.id,
				reason: 'Invalid or unnecessary acceleration',
				newMatchState: this.snapshot()
			}];
		}
		skInst.cooldown --;
		var results: IEventResult[] = [<IAccelResult>{
			type: TurnEventResultType.ACCEL,
			entityId: ent.id,
			skillDefId: skInst.skillDefId,
			newMatchState: this.snapshot(),
		}];
		if(ent.hasPassive('VITALITY')) {
			results = results.concat(this.changeEntityHp(ent, 10));
		}
		return results;
	}

	turnEnding(playerIds: string[]): IEventCause {
		var endTurnCause: IEventCause = {
			entityId: undefined,
			actionDefId: 'TURN_END',
			targetId: undefined,
			results: [],
		};

		playerIds.forEach((username) => {
			var player = this.players[username];

			if(player.team === getActingTeam(this)) { // at the end of a player's turn
				// trigger poison
				if(player.getStef(ALL_STEFS.POISON.id)) {
					endTurnCause.results = endTurnCause.results.concat(this.changeEntityHp(player, -10));
				}

				// trigger rejuvenation
				let lane = this.lanes[player.state.y];
				if(lane.getStef('REJUV', player.team)) {
					endTurnCause.results = endTurnCause.results.concat(this.changeEntityHp(player, 10));
				}

				// tick respawn
				if(!player.alive && this.turn > player.state.diedTurn) {
					// don't tick if death is "fresh". Need a meaningful turn of death before respawn
					player.state.respawn--;
					if(player.state.respawn === 0) {
						endTurnCause.results = endTurnCause.results.concat(this.respawn(player));
					}
				}

				// tick cooldowns
				player.state.actives.forEach((active) => {
					if(active.cooldown > 0) {
						active.cooldown--;
					}
				});

				// tick stefs
				player.state.stefs.forEach((stef) => {
					if(this.turn > stef.invokedTurn && stef.duration > 0) {
						stef.duration--;
						if(stef.duration === 0) {
							player.loseStef(stef.stefId);
						}
					}
				});

			} else { // end of opponent turn, aka start of player's turn
			}
		});

		this.lanes.forEach((lane) => {
			var actingTeam = getActingTeam(this);
			lane.getTeamStefs(actingTeam).forEach((stef) => {
				stef.duration--;
				if(stef.duration === 0) {
					lane.loseStef(stef.stefId, actingTeam);
				}
			});
		});

		return endTurnCause;
	}

	/* Util */
	getPlayerIds(): string[] {
		return Object.keys(this.players);
	}
	getPlayers(): Entity[] {
		return this.getPlayerIds().map((id) => (this.players[id]));
	}
	getPlayersReady(): {[key: string]: boolean} {
		var x = {};
		for(let username of Object.keys(this.players)) {
			x[username] = this.playerDecisions[username] !== undefined;
		}
		return x;
	}
	allPlayersReady(): boolean {
		return Object.keys(this.playerDecisions).length === Object.keys(this.players).length;
	}
}