import * as React from 'react';
import { ISkillDef, ISkillInstance, Skills } from '../../common/game-info/skills';

interface Props {
	skills: ISkillInstance[];
	onSelect: (skillId: string)=>any;
	currentChoiceActionDef: ISkillDef;
	disableAll: boolean;
}

export class SkillList extends React.Component<Props, {}> {
	constructor(props) {
		super(props);
		this.selectSkill = this.selectSkill.bind(this);
		this.renderSkill = this.renderSkill.bind(this);
	}

	render() {
		return (
			<div className="skill-list">
				{this.props.skills.map((sk) => this.renderSkill(sk))}
			</div>
		);
	}

	renderSkill(sk: ISkillInstance) {
		var def = Skills[sk.skillDefId];
		var cooldownText = sk.cooldown > 0 ? (sk.cooldown === 1 ? 'Ready next turn' : `${sk.cooldown} cycles left`) : 'Ready (5 cycles)';
		var currentlySelected = this.props.currentChoiceActionDef && this.props.currentChoiceActionDef.id === sk.skillDefId ? 'selected' : '';
		var disabled = this.props.disableAll || sk.cooldown > 0 ? 'disabled' : '';
		var accelText = sk.cooldown > 1 ? 'Accelerate!?' : '';
		return (
			<div key={def.id} className={`skill-card choice-card ${currentlySelected} ${disabled}`} onClick={()=>{this.selectSkill(def.id)}}>
				<p className="card-header">{def.name}</p>
				<p className="card-desc">{def.desc}</p>
				<p className="card-cooldown">{cooldownText}</p>
				<p className="card-accel">{accelText}</p>
			</div>
		);
	}

	selectSkill(id: string) {
		this.props.onSelect(id);
	}

	static defaultProps = {
		skills: []
	}
}
