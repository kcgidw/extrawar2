import * as React from 'react';
import { IMatchState, Phase, TargetWhat } from '../common/game-core/common';
import { Entity } from '../common/game-core/entity';
import { flatReport, IActionResolutionTimeline } from '../common/game-core/event-interfaces';
import { ISkillDef, ISkillInstance, Skills } from '../common/game-info/skills';
import { getActingTeam, usernameShouldAct, validEntityTarget, validLaneTarget } from '../common/match-util';
import * as Msgs from '../common/messages';
import { SOCKET_MSG } from '../common/messages';
import { ChatWindow } from './chat-window';
import * as Handler from './client-handler';
import { Popover } from './game-ui/popover';
import { SkillList } from './game-ui/skill-list';
import { GameView } from './game-view';
import { WaitingRoomView } from './waiting-room-view';
import { Timer } from './timer';
import { ALL_STEFS } from '../common/game-info/stefs';

export enum MenuState {
	WAITING_ROOM, CHOOSE_CHARACTER, CHOOSE_STARTING_LANE, CHOOSE_ACTION, CHOOSE_TARGET, WAITING, RESOLVING, GAME_OVER
}

interface Props {
	username: string;
	initialRoomUsernames: string[];
	roomId: string;
	importedMatchState: IMatchState;
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

	notify: string;

	timer: Timer;
}

export class RoomView extends React.Component<Props, State> {
	handlers: Array<()=>any>;

	constructor(props) {
		super(props);

		let importedState = this.props.importedMatchState;
		let startingMenu = MenuState.WAITING_ROOM;
		if(importedState) {
			if(usernameShouldAct(importedState, this.props.username)) {
				startingMenu = MenuState.CHOOSE_ACTION;
			} else {
				startingMenu = MenuState.WAITING;
			}
		}

		this.state = {
			ms: importedState,
			menu: startingMenu,
			chatLog: [],
			roomUsernames: this.props.initialRoomUsernames,
			actionChoices: undefined,
			currentSelectedActionChoice: undefined,
			currentSelectedLaneId: undefined,
			currentSelectedEntityId: undefined,
			notify: undefined,
			timer: undefined
		};

		this.ShowGameView = this.ShowGameView.bind(this);
		this.ShowWaitingRoomView = this.ShowWaitingRoomView.bind(this);
		this.selectCharacter = this.selectCharacter.bind(this);
		this.selectStartingLane = this.selectStartingLane.bind(this);
		this.selectAction = this.selectAction.bind(this);
		this.selectTarget = this.selectTarget.bind(this);
		this.notifyInvalidTarget = this.notifyInvalidTarget.bind(this);
		this.me = this.me.bind(this);
		this.myTurn = this.myTurn.bind(this);
	}

	componentDidMount() {
		this.handlers = [
			Handler.generateHandler('disconnect', () => {
				this.addErrorMessage(SOCKET_MSG.LOBBY_NUM_ONLINE, 'Connection lost.');
			}),
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
						// note: We're checking for the upcoming matchstate
						if(usernameShouldAct(data.matchState, this.props.username)) {
							nextMenu = MenuState.CHOOSE_ACTION;
							let timer = new Timer(30 * 1000,
								()=>{
									this.setState({timer: timer})
								}, () => {
									this.timeUp(timer);
								}
							);
							this.setState({
								timer: timer
							});
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
			}),
		];
	}

	componentWillUnmount() {
		this.handlers.forEach((fn) => {
			fn();
		});
	}

	render() {
		var skillList = this.state.ms ? <SkillList skills={this.me().state.actives}
			onSelect={this.selectAction} currentChoiceActionDef={this.state.currentSelectedActionChoice}
			disableAll={!usernameShouldAct(this.state.ms, this.props.username)}/> : null;
		return (
			<div id="match">
				<this.ShowGameView />
				<this.ShowWaitingRoomView />
				< Popover message={this.state.notify} />
				<ChatWindow logs={this.state.chatLog} />
				{skillList}
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
				timeLeftMs={this.state.timer ? this.state.timer.timeLeftMs() : null}
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
			messageClass: Msgs.ChatMessageClass.SYSTEM,
		});
	}
	addResolveMessage(msgName: SOCKET_MSG, msg: string) {
		this.addUserChatMessage({
			messageName: msgName,
			username: undefined,
			timestamp: new Date(),
			message: msg,
			messageClass: Msgs.ChatMessageClass.RESOLVE,
		});
	}
	addErrorMessage(msgName: SOCKET_MSG, msg: string) {
		this.addUserChatMessage({
			messageName: msgName,
			username: undefined,
			timestamp: new Date(),
			message: msg,
			messageClass: Msgs.ChatMessageClass.SYS_ERR,
		});
	}

	/* MATCH */

	sendStartGame() {
		Handler.sendStartGame();
	}

	myTurn(): boolean {
		return this.state.ms.turn === -1 || getActingTeam(this.state.ms) === this.me().team;
	}
	me(): Entity {
		return this.state.ms.players[this.props.username];
	}
	iAmAlive(): boolean {
		return this.me().state.hp > 0;
	}

	selectCharacter(id: string) {
		if(this.state.menu === MenuState.CHOOSE_CHARACTER) {
			let entProfId = id as string;
			Handler.chooseCharacter(entProfId);
			this.setState({menu: MenuState.WAITING});
		} else {
			// event falls through
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
		let actionDef = Skills[actionDefId];
		let instance = this.me().state.actives.find((i) => (i.skillDefId === id));

		if(!this.myTurn()) {
			this.addErrorMessage(SOCKET_MSG.PLAYER_DECISION, `It's not your turn.`);
			return;
		}
		if(!this.iAmAlive()) {
			this.addErrorMessage(SOCKET_MSG.PLAYER_DECISION, `You can't act - you're dead.`);
			return;
		}
		if(actionDef.active && actionDef.cooldown > 0 && instance.cooldown === 0 && this.me().state.stefs.find((s)=>(s.stefId===ALL_STEFS.PANIC.id))) {
			this.addErrorMessage(SOCKET_MSG.PLAYER_DECISION, `You're panicked - you can't use skills.`);
			return;
		}
		if(actionDefId === 'MOVE' && this.me().state.stefs.find((stef)=>(stef.stefId === ALL_STEFS.TRAPPED.id))) {
			this.addErrorMessage(SOCKET_MSG.PLAYER_DECISION, `You're trapped - you can't move yourself.`);
			return;
		}

		if([MenuState.CHOOSE_ACTION, MenuState.CHOOSE_TARGET].indexOf(this.state.menu) !== -1) {
			if(instance) {
				if(instance.cooldown > 1) { // accelerate
					this.setState({
						currentSelectedActionChoice: Skills[actionDefId],
					}, () => {
						this.submitActionAndSetWaiting(this.state.currentSelectedActionChoice.id, true);
					});
				} else if(actionDef.target.what === TargetWhat.NONE) { // submit now
					this.setState({
						currentSelectedActionChoice: Skills[actionDefId],
					}, () => {
						this.submitActionAndSetWaiting(undefined);
					});
				} else { // choose target
					this.setState({
						currentSelectedActionChoice: Skills[actionDefId],
						menu: MenuState.CHOOSE_TARGET,
					});
				}
			}
		} else {
			console.warn('unwarranted action select');
		}
	}
	selectTarget(id: number|string) {
		var user = this.state.ms.players[this.props.username];
		if(this.state.menu === MenuState.CHOOSE_TARGET) {
			if(typeof id === 'number') {
				let laneId = id as number;
				if(validLaneTarget(user, laneId, this.state.currentSelectedActionChoice)) {
					this.submitActionAndSetWaiting(laneId);
					this.setState({
						currentSelectedLaneId: laneId,
					});
				} else {
					this.addErrorMessage(SOCKET_MSG.PLAYER_DECISION, 'Invalid target.');
				}
			} else if(typeof id === 'string') {
				let entId = id as string;
				let ent = this.state.ms.players[entId];
				if(validEntityTarget(user, ent, this.state.currentSelectedActionChoice)) {
					this.submitActionAndSetWaiting(entId);
					this.setState({
						currentSelectedEntityId: entId,
					});
				} else {
					this.addErrorMessage(SOCKET_MSG.PLAYER_DECISION, 'Invalid target.');
				}
			}
		} else {
			// let the click fall through
		}
	}

	submitActionAndSetWaiting(targetId: number|string, accel?: boolean) {
		var action: ISkillDef;
		if(accel) {
			action = Skills.ACCEL;
		} else {
			action = this.state.currentSelectedActionChoice;
		}
		Handler.chooseActionAndTarget(action, targetId, accel);
		this.state.timer.kill();
		this.setState({
			menu: MenuState.WAITING,
			timer: undefined,
		});
	}

	notifyInvalidTarget() {
		this.setState({
			notify: 'Invalid target.'
		}, () => {
			setTimeout(() => {
				this.setState({
					notify: undefined
				});
			}, 5*1000);
		});
	}

	timeUp(t: Timer) {
		this.setState({
			timer: t
		});
		alert('Time up');
	}
}