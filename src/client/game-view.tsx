import * as React from 'react';
import { IMatchState, Phase, TargetWhat } from '../common/game-core/common';
import { Entity } from '../common/game-core/entity';
import { ISkillDef, ISkillInstance } from '../common/game-info/skills';
import { ActionChoices } from './game-ui/action-choices';
import { CharacterChoices } from './game-ui/character-choices';
import { Lane } from './game-ui/lane';
import { TeamPanel } from './game-ui/team-panel';
import { actionDefTargetsEntity, getActingTeam } from '../common/match-util';

interface IProps {
	username: string;
	matchState: IMatchState;
	menuState: MenuState;
	actionChoices: ISkillInstance[];
	currentSelectedActionChoice: ISkillDef;
	currentSelectedLaneId: number;
	currentSelectedEntityId: string;
	selectCharacter;
	selectStartingLane;
	selectAction;
	selectTarget;
}
export enum MenuState {
	WAITING_ROOM, CHOOSE_CHARACTER, CHOOSE_STARTING_LANE, CHOOSE_ACTION, CHOOSE_TARGET, WAITING, RESOLVING, GAME_OVER
}
interface IState {
}

export class GameView extends React.Component<IProps, IState> {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.lanesSelectable = this.lanesSelectable.bind(this);
		this.entitiesSelectable = this.entitiesSelectable.bind(this);

		this.selectCharacter = this.selectCharacter.bind(this);
		this.selectStartingLane = this.selectStartingLane.bind(this);
		this.selectAction = this.selectAction.bind(this);
		this.selectTarget = this.selectTarget.bind(this);
		this.selectLane = this.selectLane.bind(this);
	}

	render() {
		var innerView;

		switch(this.props.matchState.phase) {
			case Phase.CHOOSE_CHARACTER:
				innerView = (
					< CharacterChoices choices={this.props.matchState.characterChoicesIds[this.props.username]} onSelectCharacter={this.selectCharacter} />
				);
				break;
			case Phase.PLAN:
			case Phase.CHOOSE_STARTING_LANE:
			case Phase.RESOLVE:
				break;
			default:
				console.warn('Bad phase ' + this.props.matchState.phase);
		}

		var entitiesByLane = getEntitiesByLane(this.props.matchState);

		return (
			<div id="game-view">
				<div id="game-prompt">{this.getPrompt()}</div>
				< TeamPanel matchState={this.props.matchState} team={1} />
				< TeamPanel matchState={this.props.matchState} team={2} />

				<div id="menu">
					{innerView}
				</div>

				<div id="lanes-container">
					<div id="lanes">
						{entitiesByLane.map((ents, idx) => (
							<Lane key={idx} id={idx} onSelect={this.selectLane} selectable={this.lanesSelectable()} selected={this.props.currentSelectedLaneId === idx} 
							entities={ents} entitiesSelectable={this.entitiesSelectable()} onSelectEntity={this.selectTarget} selectedEntityId={this.props.currentSelectedEntityId} />
						))}
					</div>
				</div>
			</div>
		);
	}

	lanesSelectable(): boolean {
		return this.props.menuState === MenuState.CHOOSE_STARTING_LANE
		|| (this.myTurn() && this.props.menuState === MenuState.CHOOSE_TARGET && this.props.currentSelectedActionChoice.target.what === TargetWhat.LANE);
	}
	
	entitiesSelectable(): boolean {
		return this.myTurn()
		&& this.props.menuState === MenuState.CHOOSE_TARGET
		&& actionDefTargetsEntity(this.props.currentSelectedActionChoice);
	}

	getPrompt() {
		switch(this.props.menuState) {
			case MenuState.CHOOSE_CHARACTER:
				return 'Choose a character.';
			case MenuState.CHOOSE_STARTING_LANE:
				return 'Choose a starting lane.';
			case MenuState.CHOOSE_ACTION:
				return 'Choose an action.';
			case MenuState.CHOOSE_TARGET:
				let targ = this.lanesSelectable() ? 'lane' : 'entity';
				return 'Choose target ' + targ + '.';
			case MenuState.WAITING:
				if(this.myTurn()) {
					return 'Waiting for other players.';
				}
				return 'Waiting for opposing team.';
			case MenuState.RESOLVING:
				return 'Resolving.';
			case MenuState.GAME_OVER:
				return 'Game over!';
		}
	}

	myTurn(): boolean { // TODO remove function duplication
		return this.props.matchState.turn === -1 || getActingTeam(this.props.matchState) === this.props.matchState.players[this.props.username].team;
	}

	selectCharacter(id) {
		this.props.selectCharacter(id);
	}
	selectStartingLane(id) {
		this.props.selectStartingLane(id);
	}
	selectAction(id) {
		this.props.selectAction(id);
	}
	selectTarget(id) {
		this.props.selectTarget(id);
	}
	selectLane(id) {
		if(this.props.menuState === MenuState.CHOOSE_STARTING_LANE) {
			this.selectStartingLane(id);
		} else if(this.props.menuState === MenuState.CHOOSE_TARGET) {
			this.selectTarget(id);
		} else {
			throw Error(''+this.props.menuState);
		}
	}
}

function getEntitiesByLane(ms: IMatchState): Entity[][] {
	var entities = ms.players;
	var res = [[],[],[],[]];
	for(let username of Object.keys(ms.players)) {
		var ent = ms.players[username];
		var y = ent.state.y;
		res[y].push(ent);
	}
	return res;
}