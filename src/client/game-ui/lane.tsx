import * as React from 'react';
import { } from '../client-handler';
import { IEntityProfile } from '../../common/game-core/rule-interfaces';
import { Characters } from '../../common/game-info/characters';
import * as Handler from '../client-handler';

interface IProps {
	id: number;
}
export class Lane extends React.Component<IProps,{}> {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div id={"lane-" + this.props.id} className="lane">
			</div>
		);
	}
}