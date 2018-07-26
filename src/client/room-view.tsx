import * as React from 'react';
import { IMatchState, Phase, TargetWhat } from '../common/game-core/common';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import { ChatWindow } from './chat-window';
import * as Handler from './client-handler';
import { GameView } from './game-view';
import { WaitingRoomView } from './waiting-room-view';
import { flatReport, IActionResolutionTimeline } from '../common/game-core/event-interfaces';
import { Skills, ISkillDef, ISkillInstance } from '../common/game-info/skills';
import { getActingTeam, getUsernameTeam } from '../common/match-util';

export enum MenuState {
	WAITING_ROOM, CHOOSE_CHARACTER, CHOOSE_STARTING_LANE, CHOOSE_ACTION, CHOOSE_TARGET, WAITING, RESOLVING, GAME_OVER
}

interface Props {
	username: string;
	initialRoomUsernames: string[];
	roomId: string;
}
interface State {
	roomUsernames: string[];
	chatLog: Msgs.IChatPostMessageResponse[];
	menu: MenuState;

	ms: IMatchState;

	actionChoices: ISkillInstance[];
	currentSelectedActionChoice: ISkillDef;
	currentSelectedLaneId: number;
	currentSelectedEntityId: string;
}

export class RoomView extends React.Component<Props, State> {
	handlers: Array<()=>any>;

	constructor(props) {
		super(props);
		this.state = {
			ms: undefined,
			menu: MenuState.WAITING_ROOM,
			chatLog: [],
			roomUsernames: this.props.initialRoomUsernames,
			actionChoices: undefined,
			currentSelectedActionChoice: undefined,
			currentSelectedLaneId: undefined,
			currentSelectedEntityId: undefined,
		};

		this.ShowGameView = this.ShowGameView.bind(this);
		this.ShowWaitingRoomView = this.ShowWaitingRoomView.bind(this);
		this.selectCharacter = this.selectCharacter.bind(this);
		this.selectStartingLane = this.selectStartingLane.bind(this);
		this.selectAction = this.selectAction.bind(this);
		this.selectTarget = this.selectTarget.bind(this);
	}

	componentDidMount() {
		this.handlers = [
			Handler.generateHandler<Msgs.IChatPostMessageResponse>(SOCKET_MSG.CHAT_POST_MESSAGE,
				(data) => {
					this.addUserChatMessage(data);
				}
			),
			Handler.generateHandler<Msgs.IRoomUsersResponse>(SOCKET_MSG.LOBBY_ROOM_USERS,
				(data) => {
					this.addSystemChatMessage(SOCKET_MSG.LOBBY_ROOM_USERS,
						data.username + (data.joined ? ' joined the room.' : ' left the room.'));
					this.setState({
						roomUsernames: data.users,
					});
				}
			),
			Handler.generateHandler<Msgs.IPromptDecisionMessage>(SOCKET_MSG.START_GAME,
				(data) => {
					this.addSystemChatMessage(SOCKET_MSG.START_GAME,
						data.requestorUsername + ' started the game.');
					this.setState({
						ms: data.matchState,
						menu: MenuState.CHOOSE_CHARACTER,
					});
				}
			),
			Handler.generateHandler<IActionResolutionTimeline>(SOCKET_MSG.RESOLVE_ACTIONS, (data) => {
				var report = flatReport(this.state.ms, data.causes);

				function done() {
					Handler.resolveDone();
				}

				var idx = 0;
				var reenact = () => {
					setTimeout(() => {
						let curEvent = report[idx];
						this.addResolveMessage(SOCKET_MSG.RESOLVE_ACTIONS, curEvent.message);
						if(curEvent.newState) {
							this.setState({
								ms: report[idx].newState,
							}, next);
						} else {
							next();
						}

						function next() {
							if(++idx < report.length) {
								reenact();
							} else {
								done();
							}
						}
					}, 0.6 * 1000);
				};
				
				this.setState({
					currentSelectedActionChoice: undefined,
					currentSelectedEntityId: undefined,
					currentSelectedLaneId: undefined,
				}, ()=> {
					reenact();
				});
			}),
			Handler.generateHandler<Msgs.IPlayersReady>(SOCKET_MSG.PLAYERS_READY, (data) => {
				this.setState({
					ms: data.matchState,
				});
			}),
			Handler.generateHandler<Msgs.IPromptDecisionMessage>(SOCKET_MSG.PROMPT_DECISION, (data) => {
				var nextMenu: MenuState;
				switch(data.phase) {
					case(Phase.CHOOSE_STARTING_LANE):
						nextMenu = MenuState.CHOOSE_STARTING_LANE;
						break;
					case(Phase.PLAN):
						if(getActingTeam(data.matchState) === getUsernameTeam(this.state.ms, this.props.username)) {
							nextMenu = MenuState.CHOOSE_ACTION;
						} else {
							nextMenu = MenuState.WAITING;
						}
						break;
				}
				this.setState({
					ms: data.matchState,
					menu: nextMenu,
					actionChoices: data.actionChoices,
					currentSelectedActionChoice: undefined,
					currentSelectedEntityId: undefined,
					currentSelectedLaneId: undefined,
				});
			})
		];
	}

	componentWillUnmount() {
		this.handlers.forEach((fn) => {
			fn();
		});
	}

	render() {
		return (
			<div id="match">
				<ChatWindow logs={this.state.chatLog} />
				<this.ShowGameView />
				<this.ShowWaitingRoomView />
			</div>
		);
	}

	ShowGameView() {
		return this.state.ms !== undefined ?
			<GameView 
				matchState={this.state.ms} 
				menuState={this.state.menu} 
				username={this.props.username}
				selectCharacter={this.selectCharacter}
				selectStartingLane={this.selectStartingLane}
				selectAction={this.selectAction}
				selectTarget={this.selectTarget}
				actionChoices={this.state.actionChoices}
				currentSelectedActionChoice={this.state.currentSelectedActionChoice}
				currentSelectedLaneId={this.state.currentSelectedLaneId}
				currentSelectedEntityId={this.state.currentSelectedEntityId}
			/> : null;
	}
	ShowWaitingRoomView() {
		return this.state.menu === MenuState.WAITING_ROOM ? < WaitingRoomView roomId={this.props.roomId} usernames={this.state.roomUsernames} onStartGame={this.sendStartGame} /> : null;
	}

	/* CHAT */

	addUserChatMessage(msg: Msgs.IChatPostMessageResponse) {
		this.setState({
			chatLog: [... this.state.chatLog, msg],
		});
	}
	addSystemChatMessage(msgName: SOCKET_MSG, msg: string) {
		this.addUserChatMessage({
			messageName: msgName,
			username: undefined,
			timestamp: new Date(),
			message: msg,
			systemMessage: true,
		});
	}
	addResolveMessage(msgName: SOCKET_MSG, msg: string) {
		this.addUserChatMessage({
			messageName: msgName,
			username: undefined,
			timestamp: new Date(),
			message: msg,
			resolveMessage: true,
		});
	}

	/* MATCH */

	sendStartGame() {
		Handler.sendStartGame();
	}

	myTurn(): boolean {
		return this.state.ms.turn === -1 || getActingTeam(this.state.ms) === this.state.ms.players[this.props.username].team;
	}

	selectCharacter(id: string) {
		if(this.state.menu === MenuState.CHOOSE_CHARACTER) {
			let entProfId = id as string;
			Handler.chooseCharacter(entProfId);
			this.setState({menu: MenuState.WAITING});
		} else {
			throw Error(''+this.state.menu);
		}
	}
	selectStartingLane(id: number) {
		if(this.state.menu === MenuState.CHOOSE_STARTING_LANE) {
			Handler.chooseStartingLane(id);
			this.setState({
				currentSelectedLaneId: id,
				menu: MenuState.WAITING
			});
		} else {
			throw Error(''+this.state.menu);
		}
	}
	selectAction(id: string) {
		let actionDefId = id as string;
		if(this.myTurn() && [MenuState.CHOOSE_ACTION, MenuState.CHOOSE_TARGET].indexOf(this.state.menu) !== -1) {
			let actionDef = Skills[actionDefId];
			if(actionDef.target.what === TargetWhat.NONE) {
				this.submitActionAndSetWaiting(undefined);
				this.setState({
					currentSelectedActionChoice: Skills[actionDefId],
				});
			} else {
				this.setState({
					currentSelectedActionChoice: Skills[actionDefId],
					menu: MenuState.CHOOSE_TARGET,
				});
			}
		} else {
			throw Error(''+this.state.menu);
		}
	}
	selectTarget(id: number|string) {
		if(this.state.menu === MenuState.CHOOSE_TARGET) {
			if(typeof id === 'number') {
				let laneId = id as number;
				this.submitActionAndSetWaiting(laneId);
				this.setState({
					currentSelectedLaneId: laneId,
				});
			} else if(typeof id === 'string') {
				let entId = id as string;
				this.submitActionAndSetWaiting(entId);
				this.setState({
					currentSelectedEntityId: entId,
				});
			}
		} else {
			// let the click fall through
		}
	}

	submitActionAndSetWaiting(targetId: number|string) {
		Handler.chooseActionAndTarget(this.state.currentSelectedActionChoice, targetId);
		this.setState({
			menu: MenuState.WAITING,
		});
	}
}