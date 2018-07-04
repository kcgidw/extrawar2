import * as React from 'react';
import * as Messages from '../common/messages';
import * as Handler from './handler';

interface IOnlineCounterState {
	count: string|number;
}
export class OnlineCounter extends React.Component<{}, IOnlineCounterState> {
	constructor(props) {
		super(props);
		this.state = {
			count: '...',
		};
	}

	componentDidMount() {
		Handler.onNumOnlineReceived((data: Messages.INumOnlineResponse) => {
			this.updateCount(data.count);
		});
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
