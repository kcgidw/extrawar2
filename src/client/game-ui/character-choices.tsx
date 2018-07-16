import * as React from 'react';
import { } from '../client-handler';
import { IEntityProfile } from '../../common/game-core/rule-interfaces';
import { Characters } from '../../common/game-info/characters';
import * as Handler from '../client-handler';

interface ICharacterChoicesProps {
	choices: string[];
}

export class CharacterChoices extends React.Component<ICharacterChoicesProps,{}> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="character-choices">
					{renderCharacterChoices(this.props.choices)}
			</div>
		);
	}
}

function renderCharacterChoices(choices: string[]) {
	return choices.map((entProfId) => 
		<CharacterChoicePanel key={entProfId} entProfile={Characters[entProfId]} />
	);
}

class CharacterChoicePanel extends React.Component<{entProfile: IEntityProfile},{}> {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	render() {
		return (
			<div className="character-choice" onClick={this.onClick}>
				{this.props.entProfile.name}
				<br />
				FACTION {this.props.entProfile.faction}
				<br />
				HP {this.props.entProfile.maxHp}
				<br />
				STR {this.props.entProfile.str}
			</div>
		);
	}

	onClick(e) {
		Handler.chooseCharacter(this.props.entProfile.id);
	}
}