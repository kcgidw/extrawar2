import * as React from 'react';
import { IEntityProfile } from '../../common/game-core/common';
import { Characters } from '../../common/game-info/characters';
import * as Handler from '../client-handler';
import { } from '../client-handler';

interface ICharacterChoicesProps {
	choices: string[];
	onSelectCharacter: (entProfId: string)=>any;
}

export class CharacterChoices extends React.Component<ICharacterChoicesProps,{}> {
	constructor(props) {
		super(props);
		this.selectCharacter = this.selectCharacter.bind(this);
	}

	render() {
		return (
			<div className="center-choices">
					{this.renderCharacterChoices(this.props.choices)}
			</div>
		);
	}
	
	renderCharacterChoices(choices: string[]) {
		return choices.map((entProfId) => 
			<CharacterChoicePanel key={entProfId} entProfile={Characters[entProfId]} onSelectCharacter={this.selectCharacter}/>
		);
	}

	selectCharacter(entProfId: string) {
		this.props.onSelectCharacter(entProfId);
	}
}

interface ICharacterChoicePanelProps {
	entProfile: IEntityProfile;
	onSelectCharacter: (charId: string)=>any;
}
class CharacterChoicePanel extends React.Component<ICharacterChoicePanelProps,{}> {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	render() {
		return (
			<div className="choice-card" onClick={this.onClick}>
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
		this.props.onSelectCharacter(this.props.entProfile.id);
	}
}