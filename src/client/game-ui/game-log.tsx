import * as React from 'react';
import { IMatchState } from '../../common/game-core/common';
import { IEventCause } from '../../common/game-core/event-interfaces';

interface Props {
	matchState: IMatchState;
	causes: IEventCause[];
	step: number;
	onFinish: ()=>any;
}
interface State {
	substep: number;
	lines: string[];
}

export class GameLog extends React.Component<Props, State> {
	constructor(props) {
		super(props);

	}
	render() {
		return (
			<div id="game-log">
				<ol>
					{this.state.lines.slice(0, this.state.substep).map((line) => (
						<li>line</li>
					))}
				</ol>
			</div>
		);
	}
}