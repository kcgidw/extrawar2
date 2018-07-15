import { IEntityProfile, Phase } from "./game-core/rule-interfaces";
import { IMatchState } from "./game-core/match";

export enum SOCKET_MSG {
	'LOBBY_NUM_ONLINE'=  'LOBBY_NUM_ONLINE',
	'LOBBY_CREATE_USER'= 'LOBBY_CREATE_USER',
	'LOBBY_CREATE_ROOM'= 'LOBBY_CREATE_ROOM',
	'LOBBY_JOIN_ROOM'= 'LOBBY_JOIN_ROOM',
	'LOBBY_ROOM_USERS'= 'LOBBY_ROOM_USERS',
	'CHAT_POST_MESSAGE'= 'CHAT_POST_MESSAGE',
	'START_GAME'= 'START_GAME',
	'CHOOSE_CHARACTER' = 'CHOOSE_CHARACTER',
	'PLAYER_DECISION' = 'PLAYER_DECISION',
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
export interface IChatPostMessageResponse extends IErrorableResponse {
	username: string;
	timestamp: Date;
	message: string;
}
export interface IStartGameResponse extends IErrorableResponse {
	username: string; // who requested
	timestamp: Date;
	characterChoiceIds: string[];
	matchState: IMatchState;
}

export interface IPlayerDecisionRequest {
	actionId: string;
	targetLane?: number;
	targetEntity?: number;
	entityProfileId?: string; // choose character
}
export interface IPlayerDecisionResponse extends IErrorableResponse {
	targetLane?: number;
	targetEntity?: number;
	entityProfileId?: string;
	usernames: string[]; // players ready
}
export interface IPlayersReady {
	usernames: string[];
}
export interface IPresentGamePhase {
	phase: Phase;
	choices?: IEntityProfile[];
}