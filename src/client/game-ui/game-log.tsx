import * as React from 'react';
import { IEventCause, EventResultTexts } from '../../common/game-core/event-interfaces';
import { Skills } from '../../common/game-info/skills';
import { IMatchState, TargetWhat, Lane } from '../../common/game-core/common';
import { Entity } from '../../common/game-core/entity';
import { actionDefTargetsEntity } from '../../server/lobby/util';

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