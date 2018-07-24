import { IMatchState, IStefInstance, Lane, Phase, TargetWhat, Team } from "../../common/game-core/common";
import { Entity } from "../../common/game-core/entity";
import { IActionResolutionTimeline, IChangeLangeResult, IDeathResult, IEventCause, IEventResult, IGainStefResult, IGameOverResult, IHpChangeResult, INoneResult, TurnEventResultType } from "../../common/game-core/event-interfaces";
import { Characters, PlayableCharacters } from "../../common/game-info/characters";
import { Skills } from "../../common/game-info/skills";
import { MAX_STEF_DURATION } from "../../common/game-info/stefs";
import { IPlayerDecisionRequest, IPromptDecisionMessage, SOCKET_MSG } from "../../common/messages";
import { User } from "../lobby/user";
import { getActingTeam, otherTeam, shuffle } from "../lobby/util";
import { ChatRoom } from "./chat-room";

const MAX_PLAYERS = 6; // TODO: any more = spectators. Make sure to update the const in lobby.ts too
const NEXT_PHASE_DELAY = 0.4 * 1000;

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

	constructor(room: ChatRoom) {
		this.room = room;
		this.lanes = [ new Lane(0), new Lane(1), new Lane(2), new Lane(3) ];

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

	getUserTeam(user: User): Team {
		return this.getUsernameTeam(user.username);
	}
	getUsernameTeam(username: string): Team {
		return this.players[username].team;
	}
	userShouldAct(user: User): boolean {
		if(this.turn % 2 === 1 && this.getUserTeam(user) === 1) {
			return true;
		}
		if(this.turn % 2 === 0 && this.getUserTeam(user) === 2) {
			return true;
		}
		return false;
	}

	enqueuePlayerDecision(user: User, decision: IPlayerDecisionRequest) {
		switch(this.phase) {
			case(Phase.CHOOSE_CHARACTER):
				this.playerDecisions[user.username] = decision;
				if(this.allReady()) {
					this.resolveDecisionsChooseCharacter();
				}
				break;
			case(Phase.CHOOSE_STARTING_LANE):
				this.playerDecisions[user.username] = decision;
				if(this.allReady()) {
					this.resolveDecisionsChooseStartingLane();
				}
				break;
			case(Phase.PLAN):
				let player = this.players[user.username];
				if(player.team === getActingTeam(this.exportState())) {
					this.playerDecisions[user.username] = decision;
					if(this.teamReady(getActingTeam(this.exportState()))) {
						this.resolveDecisionsChooseAction();
					}
				}
				break;
			case(Phase.RESOLVE):
				this.playerDecisions[user.username] = {
					username: user.username,
					phase: Phase.RESOLVE,
				};
				if(this.allReady()) {
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
			this.players[username] = new Entity(this.room.findUser(username), this.getUsernameTeam(username), entProfile);
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

		var idx = 0;
		var pcs = Object.keys(PlayableCharacters);
		shuffle(pcs);
		this.room.users.forEach((usr) => {
			var a = pcs[idx++];
			idx %= pcs.length;
			var b = pcs[idx++];
			idx %= pcs.length;
			this.characterChoicesIds[usr.username] = [a, b];
		});

		return this.characterChoicesIds;
	}

	exportState(): IMatchState {
		return {
			players: this.players,
			team1: this.team1,
			team2: this.team2,
			turn: this.turn,
			phase: this.phase,
			lanes: this.lanes,
			characterChoicesIds: this.characterChoicesIds,
			playersReady: this.getPlayersReady()
		};
	}
	getPlayersReady(): {[key: string]: boolean} {
		var x = {};
		for(let username of Object.keys(this.players)) {
			x[username] = this.playerDecisions[username] !== undefined;
		}
		return x;
	}
	allReady(): boolean {
		return Object.keys(this.playerDecisions).length === Object.keys(this.players).length;
	}
	teamReady(t: Team): boolean {
		var teamString = 'team'+t;
		return this[teamString].every((username) => (this.playerDecisions[username] !== undefined));
	}

	nextPhase(phase: Phase) {
		this.phase = phase;
		switch(phase) {
			case(Phase.CHOOSE_STARTING_LANE):
				this.resetDecisions();
				this.room.users.forEach((user) => {
					var player = this.players[user.username];
					user.emit(SOCKET_MSG.PROMPT_DECISION, <IPromptDecisionMessage>{
						messageName: SOCKET_MSG.PROMPT_DECISION,
						phase: phase,
						matchState: this.exportState(),
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
					var player = this.players[user.username];
					var shouldAct = this.userShouldAct(user);
					user.emit(SOCKET_MSG.PROMPT_DECISION, <IPromptDecisionMessage>{
						messageName: SOCKET_MSG.PROMPT_DECISION,
						phase: phase,
						matchState: this.exportState(),
						actionChoiceIds: shouldAct ? ['ATTACK', 'MOVE', 'ULTRA_HYPER_KILLER'] : [],
					});
				});
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
					var target: Entity|Lane;
					if(actionDef.target.what === TargetWhat.LANE) {
						target = this.lanes[decision.targetLane];
					}
					if(actionDef.target.what === TargetWhat.ALLY || actionDef.target.what === TargetWhat.ENEMY || actionDef.target.what === TargetWhat.ENTITY) {
						target = this.players[decision.targetEntity];
					}
					var res = actionDef.fn(this, this.players[username], target, {});
					var resObj: IEventCause = {
						entityId: (<IEventCause>res).entityId || username,
						actionDefId: (<IEventCause>res).actionDefId || actionDef.id,
						targetId: (<Entity>target).id || (<Lane>target).y,
						results: res.results,
					};
					causes.push(resObj);
				});

				// tick respawn timers
				players.forEach((username) => {
					var player = this.players[username];
					if(!player.alive) {
						if(--player.state.respawn === 0) {
							player.state.maxHp = player.profile.maxHp;
							player.state.hp = player.profile.maxHp;
						}
					}
				});

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

	changeEntityHp(ent: Entity, change: number, custom?: object): IEventResult[] {
		var results: IEventResult[] = [];

		if(!ent.alive) {
			results.push(<INoneResult>{
				type: TurnEventResultType.NONE,
				entityId: ent.id,
				reason: 'Entity already dead'
			});
		} else {
			ent.state.hp += change;
			results.push(<IHpChangeResult>{
				type: TurnEventResultType.HP_CHANGE,
				entityId: ent.username,
				value: change,
				newMatchState: this.exportState(),
			});

			if(!ent.alive) {
				ent.state.hp = 0;
				results = results.concat(this.onDeath(ent));
			}
		}

		return results;
	}

	applyStef(ent: Entity, stefId: string, duration: number, invokerEntity: Entity): IEventResult[] {
		var results: IEventResult[] = [];

		if(!ent.alive) {
			results.push(<INoneResult>{
				type: TurnEventResultType.NONE,
				entityId: ent.id,
				reason: 'Entity already dead'
			});
		} else {
			var stef: IStefInstance = ent.hasStef(stefId);
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
					invokerEntityId: invokerEntity.id
				};
			}
			results.push(<IGainStefResult>{
				type: TurnEventResultType.GAIN_STEF,
				entityId: ent.id,
				stefId: stefId,
				newMatchState: this.exportState()
			});
		}
		return results;
	}

	moveEntity(ent: Entity, lane: Lane, range: number): IEventResult[] {
		if(Math.abs(ent.state.y - lane.y) <= range) {
			ent.state.y = lane.y;
		}
		return [<IChangeLangeResult>{
			type: TurnEventResultType.CHANGE_LANE,
			entityId: ent.id,
			laneId: lane.y,
			newMatchState: this.exportState(),
		}];
	}

	onDeath(ent: Entity): IEventResult[] {
		var results: IEventResult[] = [];
		results.push(<IDeathResult>{
			type: TurnEventResultType.DEATH,
			entityId: ent.id,
			newMatchState: this.exportState(),
		});

		ent.state.respawn = ent.state.nextRespawn;
		ent.state.nextRespawn++;

		if(this.teamDead(ent.team)) {
			this.gameOver = true;
			results.push(<IGameOverResult> {
				type: TurnEventResultType.GAME_OVER,
				winner: otherTeam(ent.team),
				newMatchState: this.exportState(),
			});
		}
		
		return results;
	}

	teamDead(t: Team): boolean {
		return this['team'+t].every((username) => {
			return !this.players[username].alive;
		});
	}
}