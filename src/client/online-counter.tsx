import * as React from 'react';
import * as Messages from '../common/messages';
import * as Handler from './handler';

interface IOnlineCounterState {
	count: string|number;
}
export class OnlineCounter extends React.Component<{}, IOnlineCounterState> {
	handlerOff: any;

	constructor(props) {
		super(props);
		this.state = {
			count: '...',
		};
	}

	componentDidMount() {
		this.handlerOff = Handler.generateHandler(Messages.SOCKET_MSG.LOBBY_NUM_ONLINE,
		(data: Messages.INumOnlineResponse) => {
			this.setState({
				count: data.count
			});
		});
	}
	componentWillUnmount() {
		this.handlerOff();
	}

	render() {
		return (
			<div id="online-counter">
				Online: {this.state.count}
			</div>
		);
	}

	updateCount(x: number) {
		this.setState({
			count: x
		});
	}
}
