import * as React from 'react';
import * as Handler from './client-handler';
import { SOCKET_MSG } from '../common/messages';
import * as Msgs from '../common/messages';
import { ChatWindow } from './chat-window';
import { IMatchState } from '../common/game-core/match';
import { IEntityProfile, Phase } from '../common/game-core/rule-interfaces';
import { CharacterChoices } from './game-ui/character-choices';
import { Lane } from './game-ui/lane';

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
	}
	componentWillUnmount() {
		this.handlerOff();
	}

	render() {
		return (
			<div id="game-view">
				<div id="game-prompt">{this.getPrompt()}</div>
				< CharacterChoices choices={this.props.matchState.characterChoicesIds[this.props.username]} />
				<div id="lanes">
					<Lane id={0} />
					<Lane id={1} />
					<Lane id={2} />
					<Lane id={3} />
				</div>
			</div>
		);
	}

	getPrompt() {
		switch(this.state.matchState.phase) {
			case(Phase.CHOOSE_CHARACTER):
				return 'Choose a character.';
			case(Phase.PLAN):
				return 'Choose an action.';
			case(Phase.RESOLVE):
				return '';
			case(Phase.GAME_OVER):
				return 'Game over!';
		}
	}
}
