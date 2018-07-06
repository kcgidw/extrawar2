import * as React from 'react';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import * as Handler from './handler';
import { RoomOptionsView, UsernameView, WaitingRoomView } from './menu-views';
import { OnlineCounter } from './online-counter';
import { GameView } from './game-view';

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
			this.setState({
				roomId: data.roomId,
				roomUsernames: data.users,
			});
			switch(this.state.curView) {
				case (VIEW.ROOM_OPTIONS):
					this.setView(VIEW.WAITING_ROOM);
					if(data.users.length === 2) {
						setTimeout(() => {
							this.setView(VIEW.GAME);
						}, 1 * 1000);
					}
					break;
				case (VIEW.WAITING_ROOM):
					if(data.users.length === 2) {
						setTimeout(() => {
							this.setView(VIEW.GAME);
						}, 1 * 1000);
					}
					break;
				case (VIEW.GAME):
					break;
				default:
					console.warn('Bad room');
			}
		});
	}

	render() {
		var showCounter;
		if(this.state.curView === VIEW.USERNAME || this.state.curView === VIEW.ROOM_OPTIONS) {
			showCounter = <OnlineCounter />;
		}

		return (
			<div id="view">
				{showCounter}
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

