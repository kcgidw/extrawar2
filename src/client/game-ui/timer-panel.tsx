import * as React from 'react';

interface Props {
	timeLeftMs: number;
}

export class TimerPanel extends React.Component<Props, {}> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="timer">
				{Math.ceil(this.props.timeLeftMs / 1000)}
			</div>
		);
	}
}