import * as React from 'react';
import { IEntityProfile } from '../../common/game-core/common';
import { Characters } from '../../common/game-info/characters';
import * as Handler from '../client-handler';
import { } from '../client-handler';
import { ISkillDef, skills } from '../../common/game-info/skills';

interface IActionChoicesProps {
	choices: string[];
}

export class ActionChoices extends React.Component<IActionChoicesProps,{}> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="choices">
					{renderActionChoices(this.props.choices)}
			</div>
		);
	}
}

function renderActionChoices(choices: string[]) {
	return choices.map((actionId) => 
		<ActionChoicePanel key={actionId} def={skills[actionId]} />
	);
}




class ActionChoicePanel extends React.Component<{def: ISkillDef},{}> {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	render() {
		return (
			<div className="choice-card" onClick={this.onClick}>
				{this.props.def.name}
				<br/>
				{this.props.def.desc}
			</div>
		);
	}

	onClick(e) {
		Handler.chooseCharacter(this.props.def.id);
	}
}