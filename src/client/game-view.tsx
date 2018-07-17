import * as React from 'react';
import { IMatchState } from '../common/game-core/common';
import { Phase } from '../common/game-core/common';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import * as Handler from './client-handler';
import { CharacterChoices } from './game-ui/character-choices';
import { Lane } from './game-ui/lane';
import { TeamPanel } from './game-ui/team-panel';
import { ActionChoices } from './game-ui/action-choices';

interface IProps {
	matchState: IMatchState;
	username: string;
}
interface IState {
	matchState: IMatchState;
	entitiesSelectable: boolean;
	lanesSelectable: boolean;
}

export class GameView extends React.Component<IProps, IState> {
	handlerOff: ()=>any;

	constructor(props) {
		super(props);
		this.state = {
			matchState: this.props.matchState,
			entitiesSelectable: false,
			lanesSelectable: false,
		};
	}

	componentDidMount() {
		var han1 = Handler.generateHandler<Msgs.IPlayersReady>(SOCKET_MSG.PLAYERS_READY, (data) => {
			this.setState({
				matchState: data.matchState,
				entitiesSelectable: false,
				lanesSelectable: false,
			});
		});
		var han2 = Handler.generateHandler<Msgs.IPromptDecisionMessage>(SOCKET_MSG.PROMPT_DECISION, (data) => {
			this.setState({
				matchState: data.matchState,
				entitiesSelectable: false,
				lanesSelectable: true,
			});
		});
		this.handlerOff = () => {
			han1();
			han2();
		};
	}
	componentWillUnmount() {
		this.handlerOff();
	}

	render() {
		var innerView;

		switch(this.state.matchState.phase) {
			case(Phase.CHOOSE_CHARACTER):
				innerView = (
					<div id="menu">
						< CharacterChoices choices={this.props.matchState.characterChoicesIds[this.props.username]} />
					</div>
				);
				break;
			case(Phase.CHOOSE_STARTING_LANE):
				break;
			case(Phase.PLAN):
				innerView = (
					<div id="menu">
						< ActionChoices choices={this.props.matchState.characterChoicesIds[this.props.username]} />
					</div>
				);
				break;
			case(Phase.RESOLVE):
				break;
			default:
				console.warn('Bad phase ' + this.state.matchState.phase);
		}

		return (
			<div id="game-view">
				<div id="game-prompt">{this.getPrompt()}</div>
				< TeamPanel matchState={this.state.matchState} team={1} />
				< TeamPanel matchState={this.state.matchState} team={2} />
				{innerView}
				<div id="lanes-container">
					<div id="lanes">
						<Lane id={0} onSelect={this.selectLane} selectable={this.state.lanesSelectable} />
						<Lane id={1} onSelect={this.selectLane} selectable={this.state.lanesSelectable} />
						<Lane id={2} onSelect={this.selectLane} selectable={this.state.lanesSelectable} />
						<Lane id={3} onSelect={this.selectLane} selectable={this.state.lanesSelectable} />
					</div>
				</div>
			</div>
		);
	}

	getPrompt() {
		switch(this.state.matchState.phase) {
			case(Phase.CHOOSE_CHARACTER):
				return 'Choose a character.';
			case(Phase.CHOOSE_STARTING_LANE):
				return 'Choose a starting lane.';
			case(Phase.PLAN):
				return 'Choose an action.';
			case(Phase.RESOLVE):
				return '';
			case(Phase.GAME_OVER):
				return 'Game over!';
		}
	}

	selectLane(laneId: number) {
		Handler.chooseStartingLane(laneId);
	}
}
