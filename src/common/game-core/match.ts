import { ChatRoom } from "../../server/chat-room/chat-room";
import { User } from "../../server/lobby/user";
import { randItem, shuffle } from "../../server/lobby/util";
import { Characters, PlayableCharacters } from "../game-info/characters";
import { Entity } from "./entity";
import { ILaneState, Team } from "./instance-interfaces";
import { IEntityProfile, Phase } from "./rule-interfaces";
import { IPlayerDecisionRequest, SOCKET_MSG, IPlayersReady } from "../messages";

const MAX_PLAYERS = 6; // TODO: any more = spectators. Make sure to update the const in lobby.ts too

interface ICharacterChoice {
	user: User;
	entProfile: IEntityProfile;
}

export interface IMatchState {
	players: {[username: string]: Entity};
	team1: string[];
	team2: string[];
	turn: number;
	phase: Phase;
	lanes: Lane[];
	characterChoicesIds: {[key: string]: string[]};
	playersReady: {[key: string]: boolean};
}

export class Match implements IMatchState {
	room: ChatRoom;

	// IMatchState implementations
	players: {[username: string]: Entity} = {};
	team1: string[] = [];
	team2: string[] = [];
	turn: number;
	phase: Phase;
	lanes: Lane[] = [];

	playersReady: {};
	characterChoicesIds: {[key: string]: string[]} = {};
	playerDecisions: {[key: string]: IPlayerDecisionRequest} = {};

	constructor(room: ChatRoom) {
		this.room = room;
		this.lanes = [ new Lane(0), new Lane(1), new Lane(2), new Lane(3) ];

		// set teams
		var team: Team;
		var char: Entity;
		room.users.forEach((usr: User, idx: number) => {
			if(idx <= MAX_PLAYERS / 2) {
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

	enqueuePlayerDecision(user: User, decision: IPlayerDecisionRequest) {
		this.playerDecisions[user.username] = decision;
		if(this.phase === Phase.CHOOSE_CHARACTER) {
			if(Object.keys(this.playerDecisions).length === Object.keys(this.players).length) {
				this.resolveDecisionsChooseCharacter();
			}
		}

	}

	resolveDecisionsChooseCharacter() {
		for(let username of Object.keys(this.playerDecisions)) {
			let choice = this.playerDecisions[username];
			let entProfile = Characters[choice.entityProfileId];
			this.players[username] = new Entity(this.room.findUser(username), this.getUsernameTeam(username), entProfile);
		}

		setTimeout(() => {
			this.resetDecisions();
			// this.presentPhase(Phase.CHOOSE_STARTING_LANE);
		}, 1*1000);
	}

	presentPhase(phase: Phase) {
		this.phase = phase;
		for(let user of this.room.users) {
			user.emit(SOCKET_MSG.CHOOSE_STARTING_LANE, this.exportState());
		}
	}

	resetDecisions() {
		this.playerDecisions = {};
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

	beginFight() {
		this.turn = 1;
		this.phase = Phase.PLAN;
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
			playersReady: this.exportPlayersReady()
		};
	}
	exportPlayersReady(): {[key: string]: boolean} {
		var x = {};
		for(let username of Object.keys(this.players)) {
			x[username] = this.playerDecisions[username] !== undefined;
		}
		return x;
	}
}

export class Lane {
	y: number;
	team1: Entity[] = [];
	team2: Entity[] = [];
	state: ILaneState;

	constructor(y: number) {
		this.y = y;
	}

	getRandomEntity(team: Team): Entity {
		var from: Entity[] = this['team'+team];
		return randItem<Entity>(from);
	}
	
}