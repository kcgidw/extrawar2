import * as React from 'react';
import * as Handler from './client-handler';
import { SOCKET_MSG } from '../common/messages';
import * as Msgs from '../common/messages';
import { ChatWindow } from './chat-window';
import { IMatchState } from '../common/game-core/match';
import { IEntityProfile, Phase } from '../common/game-core/rule-interfaces';
import { CharacterChoices } from './game-ui/character-choices';

interface props {
	characterChoiceIds: string[];
}

export class GameView extends React.Component<props, IMatchState> {
	handlerOff: ()=>any;

	constructor(props) {
		super(props);
	}

	componentDidMount() {
	}
	componentWillUnmount() {
		this.handlerOff();
	}

	render() {
		return (
			<div id="game-view">
				< CharacterChoices choices={this.props.characterChoiceIds} />
			</div>
		);
	}
}
