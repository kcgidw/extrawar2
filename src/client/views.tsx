import * as React from 'react';
import { IMatchState } from '../common/game-core/common';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import * as Handler from './client-handler';
import { RoomOptionsView, UsernameView } from './menu-views';
import { OnlineCounter } from './online-counter';
import { RoomView } from './room-view';

enum VIEW {
	USERNAME = 'username-entry',
	ROOM_OPTIONS = 'room-options',
	IN_ROOM = 'match',
}

interface IViewsState {
	curView: string;
	roomId: string;
	roomUsernames: string[];
	myUsername: string;
	
	matchState: IMatchState;
}
export class Views extends React.Component<{}, IViewsState> {
	handlers: Array<()=>any>;

	constructor(props) {
		super(props);
		this.state = {
			curView: VIEW.USERNAME,
			roomId: undefined,
			roomUsernames: undefined,
			myUsername: undefined,
			matchState: undefined,
		};
	}

	componentDidMount() {
		this.handlers = [
			Handler.generateHandler<Msgs.ICreateUserResponse>(SOCKET_MSG.LOBBY_CREATE_USER, (data) => {
				this.setState({
					myUsername: data.username,
				});
				this.setView(VIEW.ROOM_OPTIONS);
			}),
			Handler.generateHandler<Msgs.ICreateRoomResponse>(SOCKET_MSG.LOBBY_CREATE_ROOM, (data) => {
				this.setState({
					roomId: data.roomId,
					roomUsernames: [this.state.myUsername],
				});
				this.setView(VIEW.IN_ROOM);
			}),
			Handler.generateHandler<Msgs.IJoinRoomResponse>(SOCKET_MSG.LOBBY_JOIN_ROOM, (data) => {
				if(data.username === this.state.myUsername && this.state.curView === VIEW.ROOM_OPTIONS) {
					this.setState({
						roomId: data.roomId,
						roomUsernames: data.users,
					});
					this.setView(VIEW.IN_ROOM);
				}
			}),
		];
	}

	render() {
		var showCounter;
		if(this.state.curView !== VIEW.IN_ROOM) {
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
				return (< UsernameView />);
			case(VIEW.ROOM_OPTIONS):
				return (< RoomOptionsView />);
			case(VIEW.IN_ROOM):
				return < RoomView roomId={this.state.roomId} username={this.state.myUsername} initialRoomUsernames={this.state.roomUsernames} />;
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

