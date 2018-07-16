import * as React from 'react';
import * as Handler from './client-handler';
import { SOCKET_MSG } from '../common/messages';
import * as Msgs from '../common/messages';

interface IChatWindowState {
	logs: Msgs.IChatPostMessageResponse[];
	err: string;
	message: string;
}
export class ChatWindow extends React.Component<{},IChatWindowState> {
	handlerOff: ()=>any;

	constructor(props) {
		super(props);
		this.state = {
			logs: [],
			err: undefined,
			message: '',
		};

		this.onSubmit = this.onSubmit.bind(this);
		this.updateMessage = this.updateMessage.bind(this);
	}

	componentDidMount() {
		var handlerOff1 = Handler.generateHandler<Msgs.IChatPostMessageResponse>(SOCKET_MSG.CHAT_POST_MESSAGE,
			(data) => {
				this.addMessage(data);
			},
			(data) => {
				this.setState({
					err: data.error,
				});
			}
		);
		var handlerOff2 = Handler.generateHandler<Msgs.IRoomUsersResponse>(SOCKET_MSG.LOBBY_ROOM_USERS,
			(data) => {
				var chatMsg: Msgs.IChatPostMessageResponse = {
					messageName: SOCKET_MSG.LOBBY_ROOM_USERS,
					username: undefined,
					message: data.username + (data.joined ? ' joined the room.' : ' left the room.'),
					timestamp: new Date() // TODO do this server-side
				};
				this.addMessage(chatMsg);
			}
		);
		var handlerOff3 = Handler.generateHandler<Msgs.IPresentGamePhase>(SOCKET_MSG.START_GAME,
			(data) => {
				// create system message
				var chatMsg: Msgs.IChatPostMessageResponse = {
					messageName: SOCKET_MSG.START_GAME,
					username: undefined,
					message: data.requestorUsername + ' started the game.',
					timestamp: new Date() // TODO do this server-side
				};
				this.addMessage(chatMsg);
			},
			(data) => {
				this.setState({
					err: data.error,
				});
			}
		);
		this.handlerOff = () => {
			handlerOff1();
			handlerOff2();
			handlerOff3();
		};
	}
	componentWillUnmount() {
		this.handlerOff();
	}

	render() {
		return (
			<div id="game-chat">
				<div id="messages-container" className="messages-container">
					<ol>{renderChatLog(this.state.logs)}</ol>
				</div>
				<form className="chat-form" action="" onSubmit={this.onSubmit}>
					<input type="text" id="chat-input" autoComplete="off" maxLength={40} placeholder="Write a chat message"
					onChange={this.updateMessage} value={this.state.message}></input>
				</form>
			</div>
		);
	}

	updateMessage(e) {
		this.setState({
			message: e.target.value,
		});
	}
	onSubmit(e) {
		var msg = this.state.message;
		if(msg) {
			Handler.sendChatMessage(msg);
			this.setState({
				message: '',
			});
		}
		e.preventDefault();
	}
	addMessage(msg: Msgs.IChatPostMessageResponse) {
		// if scroll is at bottom, scroll down again to show new message
		var container = document.getElementById('messages-container');
		var scrollDown = container.scrollTop + container.clientHeight === container.scrollHeight;

		this.setState({
			logs: [... this.state.logs, msg]
		});
		
		if(scrollDown) {
			container.scrollTop = container.scrollHeight;
		}
	}
}

function renderChatLog(messages: Msgs.IChatPostMessageResponse[]) {
	return messages.map((msg) => {
		var displayMessage;
		if(msg.username) {
			displayMessage = <span className="user-message">
				<span className="chat-user-tag">[{msg.username}]: </span>{msg.message}
			</span>;
		} else {
			displayMessage = <span className="system-message">{msg.message}</span>;
		}
		return (
			<li key={msg.username+msg.timestamp}>
				{displayMessage}
			</li>
		);
	});
}
