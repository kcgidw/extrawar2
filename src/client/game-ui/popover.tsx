import * as React from 'react';

interface Props {
	message: string;
}

export class Popover extends React.Component<Props,{}> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className={`popover ${this.props.message ? 'show' : 'hide'}`}>
				{this.props.message}
			</div>
		);
	}
}
