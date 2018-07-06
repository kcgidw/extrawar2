import * as React from 'react';
import * as Handler from './handler';
import { SOCKET_MSG } from '../common/messages';
import * as Msgs from '../common/messages';
import { ChatWindow } from './chat-window';

export class GameView extends React.Component<{},{}> {
	handlerOff: ()=>any;

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		// this.handlerOff = Handler.generateHandler<Msgs.IJoinRoomResponse>(SOCKET_MSG.LOBBY_JOIN_ROOM,
		// 	(data) => {
		// 		return;
		// 	},
		// 	(data) => {
		// 		this.setState({
		// 			joinErr: data.error,
		// 		});
		// 	}
		// );
	}
	componentWillUnmount() {
		this.handlerOff();
	}

	render() {
		return (
			<ChatWindow/>
		);
	}
}
