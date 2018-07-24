import * as React from 'react';
import { ISkillDef, Skills, ISkillInstance } from '../../common/game-info/skills';

interface IActionChoicesProps {
	choices: ISkillInstance[];
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
				{
					this.props.choices.map((skill) => {
						var def = Skills[skill.skillDefId];
						if(!def) {
							console.warn('bad def ' + skill.skillDefId);
						}
						return <ActionChoiceCard key={def.id} def={def} skill={skill} onSelect={this.onSelectAction}
							currentlySelected={this.props.currentChoiceActionDef && def.id === this.props.currentChoiceActionDef.id} />
					})
				}
			</div>
		);
	}

	onSelectAction(actionId: string) {
		this.props.onSelectAction(actionId);
	}
}


interface IActionChoiceCardProps {
	skill: ISkillInstance;
	def: ISkillDef;
	onSelect: (actionId: string)=>any;
	currentlySelected: boolean;
}

class ActionChoiceCard extends React.Component<IActionChoiceCardProps,{}> {
	constructor(props) {
		super(props);
		this.onSelect = this.onSelect.bind(this);
	}

	render() {
		var classes = [
			'choice-card',
			this.props.currentlySelected ? 'current-action-choice' : '',
			this.props.skill.cooldown > 0 ? 'disabled' : '',
		].join(' ');
		return (
			<div className={classes} onClick={this.onSelect}>
				<p className="card-header">{this.props.def.name}</p>
				<p>{this.props.def.desc}</p>
				{(() => {
					if(this.props.skill.cooldown > 0) {
						return <p className="cooldown">{this.props.skill.cooldown} cycles left.</p>
					}
				})()}
			</div>
		);
	}

	onSelect(e) {
		this.props.onSelect(this.props.def.id);
	}
}