import * as React from 'react';
import { IMatchState } from '../common/game-core/common';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import { ChatWindow } from './chat-window';
import * as Handler from './client-handler';
import { GameView } from './game-view';
import { WaitingRoomView } from './waiting-room-view';

export enum MenuState {
	WAITING_ROOM, CHOOSE_CHARACTER, CHOOSE_STARTING_LANE, CHOOSE_ACTION, CHOOSE_TARGET, WAITING, RESOLVING, GAME_OVER
}

interface Props {
	username: string;
	initialRoomUsernames: string[];
	roomId: string;
}
interface State {
	roomUsernames: string[];
	chatLog: Msgs.IChatPostMessageResponse[];
	menu: MenuState;

	ms: IMatchState;
}

export class RoomView extends React.Component<Props, State> {
	handlers: Array<()=>any>;

	constructor(props) {
		super(props);
		this.state = {
			ms: undefined,
			menu: MenuState.WAITING_ROOM,
			chatLog: [],
			roomUsernames: this.props.initialRoomUsernames,
		};

		this.ShowGameView = this.ShowGameView.bind(this);
		this.ShowWaitingRoomView = this.ShowWaitingRoomView.bind(this);
	}

	componentDidMount() {
			Handler.generateHandler<Msgs.IChatPostMessageResponse>(SOCKET_MSG.CHAT_POST_MESSAGE,
				(data) => {
					this.addUserChatMessage(data);
				}
			);
			Handler.generateHandler<Msgs.IRoomUsersResponse>(SOCKET_MSG.LOBBY_ROOM_USERS,
				(data) => {
					this.addSystemChatMessage(SOCKET_MSG.LOBBY_ROOM_USERS,
						data.username + (data.joined ? ' joined the room.' : ' left the room.'));
					this.setState({
						roomUsernames: data.users,
					});
				}
			);
			Handler.generateHandler<Msgs.IPromptDecisionMessage>(SOCKET_MSG.START_GAME,
				(data) => {
					this.addSystemChatMessage(SOCKET_MSG.START_GAME,
						data.requestorUsername + ' started the game.');
					this.setState({
						ms: data.matchState,
						menu: MenuState.CHOOSE_CHARACTER,
					});
				}
			);
	}

	componentWillUnmount() {
		this.handlers.forEach((fn) => {
			fn();
		});
	}

	render() {
		return (
			<div id="match">
				<ChatWindow logs={this.state.chatLog} />
				<this.ShowGameView />
				<this.ShowWaitingRoomView />
			</div>
		);
	}

	ShowGameView() {
		return this.state.ms !== undefined ? <GameView initialMatchState={this.state.ms} username={this.props.username}/> : null;
	}
	ShowWaitingRoomView() {
		return this.state.menu === MenuState.WAITING_ROOM ? < WaitingRoomView roomId={this.props.roomId} usernames={this.state.roomUsernames} onStartGame={this.sendStartGame} /> : null;
	}

	addUserChatMessage(msg: Msgs.IChatPostMessageResponse) {
		this.setState({
			chatLog: [... this.state.chatLog, msg],
		});
	}
	addSystemChatMessage(msgName: SOCKET_MSG, msg: string) {
		this.addUserChatMessage({
			messageName: msgName,
			username: undefined,
			timestamp: new Date(),
			message: msg,
		});
	}

	sendStartGame() {
		Handler.sendStartGame();
	}
}