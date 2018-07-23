import * as React from 'react';

interface IWaitingRoomViewProps {
	roomId: string;
	usernames: string[];
	onStartGame: ()=>any;
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
				<button type="button" id="start-game-btn" onClick={this.props.onStartGame}>Start Game</button>
			</div>
		);
	}
}

function renderPlayersList(usernames: string[]) {
	return usernames.map((name) => (
		<li key={name}>{name}</li>
	));
}
