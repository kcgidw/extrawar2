import * as React from 'react';
import { } from '../client-handler';

interface IProps {
	id: number;
	onSelect: (laneId: number)=>any;
	selectable: boolean;
}
export class Lane extends React.Component<IProps,{}> {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	render() {
		var classes = 'lane ' + (this.props.selectable ? 'selectable' : '');
		return (
			<div id={"lane-" + this.props.id} className={classes} onClick={this.onClick}></div>
		);
	}
	onClick(e) {
		if(this.props.selectable) {
			this.props.onSelect(this.props.id);
		}
	}
}