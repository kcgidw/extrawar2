import { IMatchState, Phase } from "./game-core/common";
import { ISkillInstance } from "./game-info/skills";

export enum SOCKET_MSG {
	'LOBBY_NUM_ONLINE'=  'LOBBY_NUM_ONLINE',
	'LOBBY_CREATE_USER'= 'LOBBY_CREATE_USER',
	'LOBBY_CREATE_ROOM'= 'LOBBY_CREATE_ROOM',
	'LOBBY_JOIN_ROOM'= 'LOBBY_JOIN_ROOM',
	'LOBBY_ROOM_USERS'= 'LOBBY_ROOM_USERS',
	'CHAT_POST_MESSAGE'= 'CHAT_POST_MESSAGE',
	'START_GAME'= 'START_GAME',
	'PLAYER_DECISION' = 'PLAYER_DECISION',
	'PLAYERS_READY' = 'PLAYERS_READY',
	'PROMPT_DECISION' = 'PROMPT_DECISION',
	'RESOLVE_ACTIONS' = 'RESOLVE_ACTIONS',
	'RESOLVE_DONE' = 'RESOLVE_DONE',
}

export interface IErrorableResponse {
	messageName: SOCKET_MSG;
	error?: string;
}

export interface INumOnlineResponse extends IErrorableResponse {
	count: number;
}
export interface ICreateUserRequest {
	username: string;
}
export interface ICreateUserResponse extends IErrorableResponse {
	username: string;
}
// no create room request obj
export interface ICreateRoomResponse extends IErrorableResponse {
	roomId: string;
}
export interface IJoinRoomRequest {
	roomId: string;
}
export interface IJoinRoomResponse extends IErrorableResponse {
	roomId: string;
	users: string[];
	username: string;
	// prevChat: IChatPostMessageResponse[]; // TODO
}
export interface IRoomUsersResponse extends IErrorableResponse {
	roomId: string;
	users: string[];
	username: string;
	joined: boolean; // else, left the room
}
export interface IChatPostMessageRequest {
	message: string;
}
export enum ChatMessageClass {
	CHAT, SYSTEM, RESOLVE, SYS_ERR
}
export interface IChatPostMessageResponse extends IErrorableResponse {
	username: string;
	timestamp: Date;
	message: string;

	// client fields
	messageClass: ChatMessageClass;
}

export interface IPlayerDecisionRequest {
	username: string;
	phase: Phase;
	actionId?: string;
	targetLane?: number;
	targetEntity?: number;
	targetSkill?: string;
	entityProfileId?: string; // choose character
	startingLane?: number; // choose starting lane
}
export interface IPlayerDecisionResponse extends IErrorableResponse {
	targetLane?: number;
	targetEntity?: number;
	entityProfileId?: string;
	startingLane?: number;
	usernames: string[]; // players ready
}
export interface IPlayersReady {
	matchState: IMatchState;
}

export interface IPromptDecisionMessage extends IErrorableResponse {
	phase: Phase;
	matchState: IMatchState;
	requestorUsername?: string;
	characterChoiceIds?: string[];
	actionChoices?: ISkillInstance[];
}
