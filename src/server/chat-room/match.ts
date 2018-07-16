import { Phase, Team } from "../../common/game-core/common";
import { Entity } from "../../common/game-core/entity";
import { IMatchState, Lane } from "../../common/game-core/match";
import { Characters, PlayableCharacters } from "../../common/game-info/characters";
import { IPlayerDecisionRequest } from "../../common/messages";
import { User } from "../lobby/user";
import { shuffle } from "../lobby/util";
import { ChatRoom } from "./chat-room";


const MAX_PLAYERS = 6; // TODO: any more = spectators. Make sure to update the const in lobby.ts too

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
		}, 1*1000);
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