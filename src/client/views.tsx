import * as React from 'react';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import * as Handler from './handler';
import { RoomOptionsView, UsernameView, WaitingRoomView } from './menu-views';
import { OnlineCounter } from './online-counter';
import { GameView } from './game-view';
import { ChatWindow } from './chat-window';

enum VIEW {
	USERNAME = 'username-entry',
	ROOM_OPTIONS = 'room-options',
	WAITING_ROOM = 'waiting-room',
	GAME = 'game',
}

interface IViewsState {
	curView: string;
	roomId: string;
	roomUsernames: string[];
	myUsername: string;
}
export class Views extends React.Component<{}, IViewsState> {
	constructor(props) {
		super(props);
		this.state = {
			curView: VIEW.USERNAME,
			roomId: undefined,
			roomUsernames: undefined,
			myUsername: undefined,
		};
	}

	componentDidMount() {
		Handler.generateHandler<Msgs.ICreateUserResponse>(SOCKET_MSG.LOBBY_CREATE_USER, (data) => {
			this.setState({
				myUsername: data.username,
			});
			this.setView(VIEW.ROOM_OPTIONS);
		});
		Handler.generateHandler<Msgs.ICreateRoomResponse>(SOCKET_MSG.LOBBY_CREATE_ROOM, (data) => {
			this.setState({
				roomId: data.roomId,
				roomUsernames: [this.state.myUsername],
			});
			this.setView(VIEW.WAITING_ROOM);
		});
		Handler.generateHandler<Msgs.IJoinRoomResponse>(SOCKET_MSG.LOBBY_JOIN_ROOM, (data) => {
			if(data.username === this.state.myUsername) {
				this.setState({
					roomId: data.roomId,
					roomUsernames: data.users,
				});
				switch(this.state.curView) {
					case (VIEW.ROOM_OPTIONS):
						this.setView(VIEW.WAITING_ROOM);
						break;
					case (VIEW.WAITING_ROOM):
						break;
					case (VIEW.GAME):
						break;
					default:
						console.warn('Bad view: ' + this.state.curView);
				}
			}
		});
		Handler.generateHandler<Msgs.IJoinRoomResponse>(SOCKET_MSG.LOBBY_ROOM_USERS, (data) => {
			this.setState({
				roomUsernames: data.users,
			});
		});
		Handler.generateHandler<Msgs.IStartGameResponse>(SOCKET_MSG.START_GAME, (data) => {
			if(this.state.curView === VIEW.WAITING_ROOM) {
				this.setView(VIEW.GAME);
			} else {
				console.warn('Bad view: ' + this.state.curView);
			}
		});
	}

	render() {
		var showCounter;
		if(this.state.curView === VIEW.USERNAME || this.state.curView === VIEW.ROOM_OPTIONS) {
			showCounter = <OnlineCounter />;
		}
		var showChat;
		if(this.state.curView === VIEW.WAITING_ROOM || this.state.curView === VIEW.GAME) {
			showChat = <ChatWindow />;
		}

		return (
			<div id="view">
				{showCounter}
				{showChat}
				{this.getViewComponent()}
			</div>
		);
	}

	getViewComponent() {
		switch(this.state.curView) {
			case(VIEW.USERNAME):
				return (
					< UsernameView />
				);
			case(VIEW.ROOM_OPTIONS):
				return (
					< RoomOptionsView />
				);
			case(VIEW.WAITING_ROOM):
				return (
					< WaitingRoomView roomId={this.state.roomId} usernames={this.state.roomUsernames} />
				);
			case(VIEW.GAME):
				return (
					< GameView />
				);
			default:
				console.error('Bad view ' + this.state.curView);
		}
	}

	setView(view: VIEW) {
		this.setState({
			curView: view
		});
	}
}

