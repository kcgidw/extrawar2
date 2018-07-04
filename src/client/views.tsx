import * as React from 'react';
import * as Handler from './handler';
import { SOCKET_MESSAGES } from '../common/messages';
import * as Messages from '../common/messages';
import { validateUsername } from '../common/validate';
import { OnlineCounter } from './online-counter';

enum VIEWS {
	USERNAME = 'username-entry',
	ROOM_OPTIONS = 'room-options',
	WAITING_ROOM = 'waiting-room',
	GAME = 'game',
}

interface IViewsProps {
	handler: object;
}
interface IViewsState {
	curView: string;
	roomId: string;
}
export class Views extends React.Component<IViewsProps, IViewsState> {
	constructor(props) {
		super(props);
		this.state = {
			curView: VIEWS.USERNAME,
			roomId: undefined,
		};
	}

	componentDidMount() {
		Handler.onUsernameResponse(() => {
			this.setView(VIEWS.ROOM_OPTIONS);
		});
	}

	render() {
		return (
			<div id="view">
				<OnlineCounter />
				{this.getViewComponent()}
			</div>
		);
	}

	getViewComponent() {
		switch(this.state.curView) {
			case(VIEWS.USERNAME):
				return (
					< UsernameView />
				);
			case(VIEWS.ROOM_OPTIONS):
				return (
					< RoomOptionsView />
				);
			case(VIEWS.WAITING_ROOM):
				return (
					< WaitingRoomView roomId={this.state.roomId} />
				);
			default:
				console.error('Bad view ' + this.state.curView);
		}
	}

	setView(view: VIEWS) {
		this.setState({
			curView: view
		});
	}
}

// interface IUsernameViewProps {
// }
interface IUsernameViewState { 
	username: string;
}
class UsernameView extends React.Component<{}, IUsernameViewState> {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
		};

		this.onSubmit = this.onSubmit.bind(this);
		this.updateUsername = this.updateUsername.bind(this);
	}

	render() {
		return (
			<div id="username-entry">
				<form id="username-form">
					<label htmlFor="username">Username</label>
					<input type="text" id="username" value={this.state.username} onChange={this.updateUsername}/>
					<button type="button" onClick={this.onSubmit}>Submit</button>
				</form>
			</div>
		);
	}

	updateUsername(e) {
		this.setState({
			username: e.target.value
		});
	}
	onSubmit(e) {
		var name = this.state.username;
		if(validateUsername(name)) {
			Handler.sendUsername(name);
		}

		e.preventDefault();
	}
}

class RoomOptionsView extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="room-options">
				<div id="room-creation">
					<button>Create a Room</button>
				</div>
				<div id="room-joining">
					<form id="username-form">
						<label htmlFor="roomId">Room ID</label>
						<input type="text" id="roomId"/>
						<button>Join</button>
					</form>
				</div>
			</div>
		);
	}
}

interface IWaitingRoomViewProps {
	roomId: string;
}
class WaitingRoomView extends React.Component<IWaitingRoomViewProps, {}> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="waiting-room">
				This room's ID: {this.props.roomId}
				Waiting for players...
				<br />
				Current players:
				<ul>
					{renderPlayersList(['a', 'b', 'c'])}
				</ul>
			</div>
		);
	}
}

function renderPlayersList(usernames: string[]) {
	return usernames.map((name) => (
		<li>name</li>
	));
}
