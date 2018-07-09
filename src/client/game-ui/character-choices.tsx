import * as React from 'react';
import { } from '../client-handler';
import { IEntityProfile } from '../../common/game-core/rule-interfaces';
import { Characters } from '../../common/game-info/characters';

interface ICharacterChoicesProps {
	choices: string[]
}

export class CharacterChoices extends React.Component<ICharacterChoicesProps,{}> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="character-choices">
				<ul>
					{renderCharacterChoices(this.props.choices)}
				</ul>
			</div>
		);
	}
}

function renderCharacterChoices(choices: string[]) {
	return choices.map((entProfId) => 
		<li key={entProfId}>
			<CharacterChoicePanel entProfile={Characters[entProfId]} />
		</li>
	);
}

class CharacterChoicePanel extends React.Component<{entProfile: IEntityProfile},{}> {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	render() {
		return (
			<div className="character-choice">
				{this.props.entProfile.name}
				<br />
				FACTION {this.props.entProfile.faction}
				<br />
				HP {this.props.entProfile.maxHp}
				<br />
				STR {this.props.entProfile.str}
				<button type="button" onClick={this.onClick}></button>
			</div>
		)
	}

	onClick(e) {
	}
}