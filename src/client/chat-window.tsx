import * as React from 'react';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import * as Handler from './client-handler';

interface Props {
	logs: Msgs.IChatPostMessageResponse[];
}
interface IChatWindowState {
	err: string;
	newMessage: string;
	logCount: number;
}

export class ChatWindow extends React.Component<Props,IChatWindowState> {
	ref: any;

	constructor(props) {
		super(props);
		this.state = {
			err: undefined,
			newMessage: '',
			logCount: 0,
		};

		this.onSubmit = this.onSubmit.bind(this);
		this.updateMessage = this.updateMessage.bind(this);

		this.ref = React.createRef();
	}

	render() {
		return (
			<div id="game-chat">
				<div id="messages-container" className="messages-container" ref={this.ref}>
					<ol>{renderChatLog(this.props.logs)}</ol>
				</div>
				<form className="chat-form" action="" onSubmit={this.onSubmit}>
					<input type="text" id="chat-input" autoComplete="off" maxLength={40} placeholder="Write a chat message"
					onChange={this.updateMessage} value={this.state.newMessage}></input>
				</form>
			</div>
		);
	}

	getSnapshotBeforeUpdate(prevProps, prevState) {
		if(prevProps.logs.length < this.props.logs.length) {
			var log = this.ref.current;
			return log.scrollHeight - log.scrollTop;
		}
		return null;
	}
	componentDidUpdate(prevProps, prevState, snapshot) {
		if(snapshot !== null) {
			var log = this.ref.current;
			log.scrollTop = log.scrollHeight - snapshot;
		}
	}

	updateMessage(e) {
		this.setState({
			newMessage: e.target.value,
		});
	}

	onSubmit(e) {
		var msg = this.state.newMessage;
		if(msg) {
			Handler.sendChatMessage(msg);
			this.setState({
				newMessage: '',
			});
		}
		e.preventDefault();
	}
}

function renderChatLog(messages: Msgs.IChatPostMessageResponse[]) {
	return messages.map((msg, idx) => {
		var displayMessage;
		if(msg.username) {
			displayMessage = <span className="user-message">
				<span className="chat-user-tag">[{msg.username}]: </span>{msg.message}
			</span>;
		} else {
			var msgClass;
			switch(msg.messageClass) {
				case Msgs.ChatMessageClass.RESOLVE:
					msgClass = 'resolve-message';
					break;
				case Msgs.ChatMessageClass.SYSTEM:
					msgClass = 'system-message';
					break;
				case Msgs.ChatMessageClass.SYS_ERR:
					msgClass = 'system-error-message';
					break;
			}
			displayMessage = <span className={msgClass}>{msg.message}</span>;
		}

		return (
			<li key={''+idx+msg.username}>
				{displayMessage}
			</li>
		);
	});
}
