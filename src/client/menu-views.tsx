import * as React from 'react';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from "../common/messages";
import { maxUsernameLength, validateUsername } from "../common/validate";
import * as Handler from './handler';

interface IUsernameViewState { 
	username: string;
}
export class UsernameView extends React.Component<{}, IUsernameViewState> {
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
			<div id="username-entry" className="lobby-menu">
				<form id="username-form" onSubmit={this.onSubmit}>
					<label htmlFor="username" id="username-label">Username</label>
					<br />
					<input type="text" id="username-input" maxLength={maxUsernameLength} value={this.state.username} onChange={this.updateUsername}/>
					<br />
					<input type="submit" id="submit-btn" value="Submit"></input>
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

interface IRoomOptionsViewState {
	joinRoomId: string;
	joinErr: string;
}
export class RoomOptionsView extends React.Component<{}, IRoomOptionsViewState> {
	handlerOff: ()=>any;

	constructor(props) {
		super(props);
		this.state = {
			joinRoomId: '',
			joinErr: undefined,
		};

		this.onSubmitCreate = this.onSubmitCreate.bind(this);
		this.onSubmitJoin = this.onSubmitJoin.bind(this);
		this.updateJoinRoomId = this.updateJoinRoomId.bind(this);
	}

	componentDidMount() {
		this.handlerOff = Handler.generateHandler<Msgs.IJoinRoomResponse>(SOCKET_MSG.LOBBY_JOIN_ROOM,
			(data) => {
				return;
			},
			(data) => {
				this.setState({
					joinErr: data.error,
				});
			}
		);
	}
	componentWillUnmount() {
		this.handlerOff();
	}

	render() {
		var showError = this.state.joinErr ? 'error' : 'hidden';
		return (
			<div id="room-options" className="lobby-menu">
				<div id="room-creation">
					<button type="button" onClick={this.onSubmitCreate}>Create a Room</button>
				</div>
				<div id="room-joining">
					Or, join a room. Enter room ID:
					<form id="username-form" onSubmit={this.onSubmitJoin}>
						<input type="text" id="join-room-id-input" minLength={4} maxLength={4} value={this.state.joinRoomId} onChange={this.updateJoinRoomId}/>
						<br />
						<input type="submit" id="join-room-submit-btn" value="Join"></input>
						<div className={showError}>Error: Room full or not found.</div>
					</form>
				</div>
			</div>
		);
	}

	updateJoinRoomId(e) {
		this.setState({
			joinRoomId: e.target.value
		});
		e.preventDefault();
	}
	onSubmitCreate(e) {
		Handler.sendCreateRoom();
		e.preventDefault();
	}
	onSubmitJoin(e) {
		Handler.sendJoinRoom(this.state.joinRoomId);
		e.preventDefault();
	}
}

interface IWaitingRoomViewProps {
	roomId: string;
	usernames: string[];
}
export class WaitingRoomView extends React.Component<IWaitingRoomViewProps, {}> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="waiting-room" className="lobby-menu">
				<div>Room ID:</div>
				<h1>{this.props.roomId}</h1>
				<br />
				<div>Waiting for players...</div>
				<div>
					Current players:
					<ul>
						{renderPlayersList(this.props.usernames)}
					</ul>
				</div>
			</div>
		);
	}
}

function renderPlayersList(usernames: string[]) {
	return usernames.map((name) => (
		<li key={name}>{name}</li>
	));
}
