import * as React from 'react';
import * as Handler from './handler';
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
		this.handlerOff = Handler.generateHandler<Msgs.IChatPostMessageResponse>(SOCKET_MSG.CHAT_POST_MESSAGE,
			(data) => {
				this.setState({
					logs: [... this.state.logs, data]
				});
			},
			(data) => {
				this.setState({
					err: data.error,
				});
			}
		);
		this.handlerOff = Handler.generateHandler<Msgs.IStartGameResponse>(SOCKET_MSG.START_GAME,
			(data) => {
				var chatMsg: Msgs.IChatPostMessageResponse = {
					messageName: SOCKET_MSG.START_GAME,
					username: undefined,
					message: data.username + ' has started the game.',
					timestamp: new Date() // TODO?
				};
				this.setState({
					logs: [... this.state.logs, chatMsg]
				});
			},
			(data) => {
				this.setState({
					err: data.error,
				});
			}
		);
	}
	componentWillUnmount() {
		this.handlerOff();
	}

	render() {
		return (
			<div id="game-chat">
				<div className="messages-container">
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
