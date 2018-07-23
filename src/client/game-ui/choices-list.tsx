import * as React from 'react';
import { IEntityProfile } from '../../common/game-core/common';
import { Characters } from '../../common/game-info/characters';
import { Skills } from '../../common/game-info/skills';
import { ISkillDef } from '../../common/game-info/skills';

interface Props {
    choicesIds: string[];
    currentSelectedActionChoiceId: string;
    action?: boolean;
    profile?: boolean;
    onSelect: (id: string)=>any;
}
interface State {

}

export class ChoicesList extends React.Component<Props, State> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="choices-container">
                <ul>
                    {this.renderChoices()}
                </ul>
            </div>
        )
    }

    renderChoices() {
        var dataList = this.props.action ? Skills : Characters;
        return this.props.choicesIds.map((id) => {
            var obj = dataList[id];
            if(this.props.action) {
                return (<CharacterChoiceCard entProfile={obj as IEntityProfile} onSelect={this.props.onSelect} />);
            } else {
                return (<ActionChoiceCard def={obj as ISkillDef} currentlySelected={obj.id === this.props.currentSelectedActionChoiceId} onSelect={this.props.onSelect} />);
            }
        });
    }
}

interface ICharacterChoiceCardProps {
	entProfile: IEntityProfile;
	onSelect: (charId: string)=>any;
}

class CharacterChoiceCard extends React.Component<ICharacterChoiceCardProps,{}> {
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
		this.props.onSelect(this.props.entProfile.id);
	}
}



interface IActionChoiceCardProps {
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