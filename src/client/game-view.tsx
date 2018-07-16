import * as React from 'react';
import { IMatchState } from '../common/game-core/match';
import { Phase } from '../common/game-core/rule-interfaces';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import * as Handler from './client-handler';
import { CharacterChoices } from './game-ui/character-choices';
import { Lane } from './game-ui/lane';
import { TeamPanel } from './game-ui/team-panel';

interface IProps {
	matchState: IMatchState;
	username: string;
}
interface IState {
	matchState: IMatchState;
}

export class GameView extends React.Component<IProps, IState> {
	handlerOff: ()=>any;

	constructor(props) {
		super(props);
		this.state = {
			matchState: this.props.matchState
		};
	}

	componentDidMount() {
		var han1 = Handler.generateHandler<Msgs.IPlayersReady>(SOCKET_MSG.PLAYERS_READY, (data) => {
			this.setState({
				matchState: data.matchState
			});
		});
		var han2 = Handler.generateHandler<Msgs.IPresentGamePhase>(SOCKET_MSG.PLAYER_DECISION, (data) => {
			this.setState({
				matchState: data.matchState
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
					< TeamPanel matchState={this.state.matchState} team={1} />
						< TeamPanel matchState={this.state.matchState} team={2} />
						< CharacterChoices choices={this.props.matchState.characterChoicesIds[this.props.username]} />
					</div>
				);
				break;
			case(Phase.CHOOSE_STARTING_LANE):
				break;
			case(Phase.PLAN):
				break;
			case(Phase.RESOLVE):
				break;
			default:
				console.warn('Bad phase ' + this.state.matchState.phase);
		}

		return (
			<div id="game-view">
				<div id="game-prompt">{this.getPrompt()}</div>
				{innerView}
				<div id="lanes-container">
					<div id="lanes">
						<Lane id={0} />
						<Lane id={1} />
						<Lane id={2} />
						<Lane id={3} />
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
}
