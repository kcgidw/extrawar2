import * as React from 'react';
import { IEntityProfile } from '../../common/game-core/common';
import { Characters } from '../../common/game-info/characters';
import * as Handler from '../client-handler';
import { } from '../client-handler';
import { ISkillDef, skills } from '../../common/game-info/skills';

interface IActionChoicesProps {
	choices: string[];
	onSelectAction: (actionId: string)=>any;
	currentChoiceActionDef: ISkillDef;
}

export class ActionChoices extends React.Component<IActionChoicesProps,{}> {
	constructor(props) {
		super(props);
		this.onSelectAction = this.onSelectAction.bind(this);
	}

	render() {
		return (
			<div className="choices">
				{this.renderActionChoices(this.props.choices)}
			</div>
		);
	}

	onSelectAction(actionId: string) {
		this.props.onSelectAction(actionId);
	}

	renderActionChoices(choices: string[]) {
		return choices.map((actionId) => 
			<ActionChoicePanel key={actionId} def={skills[actionId]} onSelect={this.onSelectAction}
			currentlySelected={this.props.currentChoiceActionDef && actionId === this.props.currentChoiceActionDef.id} />
		);
	}
}


interface IActionChoicePanelProps {
	def: ISkillDef;
	onSelect: (actionId: string)=>any;
	currentlySelected: boolean;
}

class ActionChoicePanel extends React.Component<IActionChoicePanelProps,{}> {
	constructor(props) {
		super(props);
		this.onSelect = this.onSelect.bind(this);
	}

	render() {
		return (
			<div className={"choice-card " + (this.props.currentlySelected ? 'current-action-choice' : '')} onClick={this.onSelect}>
				{this.props.def.name}
				<br/>
				{this.props.def.desc}
			</div>
		);
	}

	onSelect(e) {
		this.props.onSelect(this.props.def.id);
	}
}