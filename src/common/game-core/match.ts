import { ChatRoom } from "../../server/chat-room/chat-room";
import { User } from "../../server/lobby/user";
import { randItem, shuffle } from "../../server/lobby/util";
import { Characters, PlayableCharacters } from "../game-info/characters";
import { Entity } from "./entity";
import { ILaneState, Team } from "./instance-interfaces";
import { IEntityProfile, Phase } from "./rule-interfaces";

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

	characterChoicesIds: {[key: string]: string[]} = {};
	characterChoiceQueue: ICharacterChoice[] = [];

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
		return this.players[user.username].team;
	}

	enqueueCharacterChoice(user: User, characterId: string): boolean {
		// TODO validate character chosen was a given option

		var entProfile = Characters[characterId];
		var newLen: number = this.characterChoiceQueue.push({user: user, entProfile: entProfile});
		if(newLen === Object.keys(this.players).length) {
			return true; // ready for processing
		}
		return false;
	}

	processCharacterChoices() {
		this.characterChoiceQueue.forEach((choice: ICharacterChoice) => {
			this.players[choice.user.username] = new Entity(choice.user, this.getUserTeam(choice.user), choice.entProfile);
		});
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
			characterChoicesIds: this.characterChoicesIds
		};
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