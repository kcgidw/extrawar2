import * as React from 'react';
import { IMatchState, TargetWhat } from '../common/game-core/common';
import { Phase } from '../common/game-core/common';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import * as Handler from './client-handler';
import { CharacterChoices } from './game-ui/character-choices';
import { Lane } from './game-ui/lane';
import { TeamPanel } from './game-ui/team-panel';
import { ActionChoices } from './game-ui/action-choices';
import { ISkillDef, Skills } from '../common/game-info/skills';
import { Entity } from '../common/game-core/entity';
import { getActingTeam, actionDefTargetsEntity } from '../server/lobby/util';
import { IActionResolutionTimeline, flatReport } from '../common/game-core/event-interfaces';

interface IProps {
	matchState: IMatchState;
	username: string;
}
export enum MenuState {
	CHOOSE_CHARACTER, CHOOSE_STARTING_LANE, CHOOSE_ACTION, CHOOSE_TARGET, WAITING, RESOLVING, GAME_OVER
}
interface IState {
	matchState: IMatchState;
	actionChoicesIds: string[];
	menuState: MenuState;

	currentSelectedActionChoice: ISkillDef;
	currentSelectedLaneId: number;
	currentSelectedEntityId: string;
}

export class GameView extends React.Component<IProps, IState> {
	handlerOff: ()=>any;

	constructor(props) {
		super(props);
		this.state = {
			matchState: this.props.matchState,
			actionChoicesIds: undefined,
			menuState: MenuState.CHOOSE_CHARACTER,
			currentSelectedActionChoice: undefined,
			currentSelectedLaneId: undefined,
			currentSelectedEntityId: undefined,
		};

		this.lanesSelectable = this.lanesSelectable.bind(this);
		this.entitiesSelectable = this.entitiesSelectable.bind(this);
		this.selectCharacterProfile = this.selectCharacterProfile.bind(this);
		this.selectLane = this.selectLane.bind(this);
		this.selectAction = this.selectAction.bind(this);
		this.selectEntity = this.selectEntity.bind(this);
	}

	componentDidMount() {
		var han1 = Handler.generateHandler<Msgs.IPlayersReady>(SOCKET_MSG.PLAYERS_READY, (data) => {
			this.setState({
				matchState: data.matchState,
			});
		});
		var han2 = Handler.generateHandler<Msgs.IPromptDecisionMessage>(SOCKET_MSG.PROMPT_DECISION, (data) => {
			var newState: MenuState;
			switch(data.phase) {
				case(Phase.CHOOSE_STARTING_LANE):
					newState = MenuState.CHOOSE_STARTING_LANE;
					break;
				case(Phase.PLAN):
					if(this.myTurn()) {
						newState = MenuState.CHOOSE_ACTION;
					} else {
						newState = MenuState.WAITING;
					}
					break;
			}
			this.setState({
				menuState: newState,
				matchState: data.matchState,
				actionChoicesIds: data.actionChoiceIds,
				currentSelectedActionChoice: undefined,
				currentSelectedLaneId: undefined,
				currentSelectedEntityId: undefined,
			});
		});
		var han3 = Handler.generateHandler<IActionResolutionTimeline>(SOCKET_MSG.RESOLVE_ACTIONS, (data) => {
			console.log(flatReport(this.state.matchState, data.causes));
		});
		this.handlerOff = () => {
			han1();
			han2();
			han3();
		};
	}
	componentWillUnmount() {
		this.handlerOff();
	}

	render() {
		var innerView;

		switch(this.state.matchState.phase) {
			case(Phase.CHOOSE_CHARACTER):
				innerView = (
					<div id="menu">
						< CharacterChoices choices={this.props.matchState.characterChoicesIds[this.props.username]} onSelectCharacter={this.selectCharacterProfile} />
					</div>
				);
				break;
			case(Phase.CHOOSE_STARTING_LANE):
				break;
			case(Phase.PLAN):
				innerView = (
					<div id="menu">
						< ActionChoices choices={this.state.actionChoicesIds} currentChoiceActionDef={this.state.currentSelectedActionChoice} onSelectAction={this.selectAction} />
					</div>
				);
				break;
			case(Phase.RESOLVE):
				break;
			default:
				console.warn('Bad phase ' + this.state.matchState.phase);
		}

		var entitiesByLane = getEntitiesByLane(this.state.matchState);

		return (
			<div id="game-view">
				<div id="game-prompt">{this.getPrompt()}</div>
				< TeamPanel matchState={this.state.matchState} team={1} />
				< TeamPanel matchState={this.state.matchState} team={2} />

				{innerView}

				<div id="lanes-container">
					<div id="lanes">
						{entitiesByLane.map((ents, idx) => (
							<Lane key={idx} id={idx} onSelect={this.selectLane} selectable={this.lanesSelectable()} selected={this.state.currentSelectedLaneId === idx} 
							entities={ents} entitiesSelectable={this.entitiesSelectable()} onSelectEntity={this.selectEntity} selectedEntityId={this.state.currentSelectedEntityId} />
						))}
					</div>
				</div>
			</div>
		);
	}

	lanesSelectable(): boolean {
		return this.state.menuState === MenuState.CHOOSE_STARTING_LANE
		|| (this.myTurn() && this.state.menuState === MenuState.CHOOSE_TARGET && this.state.currentSelectedActionChoice.target.what === TargetWhat.LANE);
	}
	
	entitiesSelectable(): boolean {
		return this.myTurn()
		&& this.state.menuState === MenuState.CHOOSE_TARGET
		&& actionDefTargetsEntity(this.state.currentSelectedActionChoice);
	}

	getPrompt() {
		switch(this.state.menuState) {
			case(MenuState.CHOOSE_CHARACTER):
				return 'Choose a character.';
			case(MenuState.CHOOSE_STARTING_LANE):
				return 'Choose a starting lane.';
			case(MenuState.CHOOSE_ACTION):
				return 'Choose an action.';
			case(MenuState.CHOOSE_TARGET):
				let targ = this.lanesSelectable() ? 'lane' : 'entity';
				return 'Choose target ' + targ + '.';
			case(MenuState.WAITING):
				if(getActingTeam(this.state.matchState) === this.state.matchState.players[this.props.username].team) {
					return 'Waiting for other players.';
				}
				return 'Waiting for opposing team.';
			case(MenuState.RESOLVING):
				return 'Resolving.';
			case(MenuState.GAME_OVER):
				return 'Game over!';
		}
	}

	selectCharacterProfile(entProfId: string) {
		Handler.chooseCharacter(entProfId);
		this.setState({menuState: MenuState.WAITING});
	}

	selectLane(laneId: number) {
		switch(this.state.menuState) {
			case(MenuState.CHOOSE_STARTING_LANE):
				Handler.chooseStartingLane(laneId);
				this.setState({
				currentSelectedLaneId: laneId,
					menuState: MenuState.WAITING
				});
				break;
			case(MenuState.CHOOSE_TARGET):
				this.submitActionAndSetWaiting(laneId);
				this.setState({
					currentSelectedLaneId: laneId,
				});
				break;
			default:
				throw new Error('bad menuState ' + this.state.menuState);
		}
	}

	selectAction(actionId: string) {
		if(this.myTurn() && [MenuState.CHOOSE_ACTION, MenuState.CHOOSE_TARGET].indexOf(this.state.menuState) !== -1) {
			let actionDef = Skills[actionId];
			if(actionDef.target.what === TargetWhat.NONE) {
				this.submitActionAndSetWaiting(undefined);
				this.setState({
					currentSelectedActionChoice: Skills[actionId],
				});
			} else {
				this.setState({
					currentSelectedActionChoice: Skills[actionId],
					menuState: MenuState.CHOOSE_TARGET,
				});
			}
		}
	}

	selectEntity(id: string) {
		if(this.state.menuState === MenuState.CHOOSE_TARGET) {
			this.submitActionAndSetWaiting(id);
			this.setState({
				currentSelectedEntityId: id,
			});
		}
	}

	submitActionAndSetWaiting(target: number|string) {
		Handler.chooseActionAndTarget(this.state.currentSelectedActionChoice, target);
		this.setState({
			menuState: MenuState.WAITING,
		});
	}

	myTurn(): boolean {
		return getActingTeam(this.state.matchState) === this.state.matchState.players[this.props.username].team;
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