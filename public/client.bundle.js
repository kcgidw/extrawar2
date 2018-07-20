/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/client/client.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/client/chat-window.tsx":
/*!************************************!*\
  !*** ./src/client/chat-window.tsx ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const Handler = __webpack_require__(/*! ./client-handler */ "./src/client/client-handler.ts");
const messages_1 = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
class ChatWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: [],
            err: undefined,
            message: '',
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
    }
    componentDidMount() {
        var handlerOff1 = Handler.generateHandler(messages_1.SOCKET_MSG.CHAT_POST_MESSAGE, (data) => {
            this.addMessage(data);
        }, (data) => {
            this.setState({
                err: data.error,
            });
        });
        var handlerOff2 = Handler.generateHandler(messages_1.SOCKET_MSG.LOBBY_ROOM_USERS, (data) => {
            var chatMsg = {
                messageName: messages_1.SOCKET_MSG.LOBBY_ROOM_USERS,
                username: undefined,
                message: data.username + (data.joined ? ' joined the room.' : ' left the room.'),
                timestamp: new Date() // TODO do this server-side
            };
            this.addMessage(chatMsg);
        });
        var handlerOff3 = Handler.generateHandler(messages_1.SOCKET_MSG.START_GAME, (data) => {
            // create system message
            var chatMsg = {
                messageName: messages_1.SOCKET_MSG.START_GAME,
                username: undefined,
                message: data.requestorUsername + ' started the game.',
                timestamp: new Date() // TODO do this server-side
            };
            this.addMessage(chatMsg);
        }, (data) => {
            this.setState({
                err: data.error,
            });
        });
        this.handlerOff = () => {
            handlerOff1();
            handlerOff2();
            handlerOff3();
        };
    }
    componentWillUnmount() {
        this.handlerOff();
    }
    render() {
        return (React.createElement("div", { id: "game-chat" },
            React.createElement("div", { id: "messages-container", className: "messages-container" },
                React.createElement("ol", null, renderChatLog(this.state.logs))),
            React.createElement("form", { className: "chat-form", action: "", onSubmit: this.onSubmit },
                React.createElement("input", { type: "text", id: "chat-input", autoComplete: "off", maxLength: 40, placeholder: "Write a chat message", onChange: this.updateMessage, value: this.state.message }))));
    }
    updateMessage(e) {
        this.setState({
            message: e.target.value,
        });
    }
    onSubmit(e) {
        var msg = this.state.message;
        if (msg) {
            Handler.sendChatMessage(msg);
            this.setState({
                message: '',
            });
        }
        e.preventDefault();
    }
    addMessage(msg) {
        // if scroll is at bottom, scroll down again to show new message
        var container = document.getElementById('messages-container');
        var scrollDown = container.scrollTop + container.clientHeight === container.scrollHeight;
        this.setState({
            logs: [...this.state.logs, msg]
        });
        if (scrollDown) {
            container.scrollTop = container.scrollHeight;
        }
    }
}
exports.ChatWindow = ChatWindow;
function renderChatLog(messages) {
    return messages.map((msg) => {
        var displayMessage;
        if (msg.username) {
            displayMessage = React.createElement("span", { className: "user-message" },
                React.createElement("span", { className: "chat-user-tag" },
                    "[",
                    msg.username,
                    "]: "),
                msg.message);
        }
        else {
            displayMessage = React.createElement("span", { className: "system-message" }, msg.message);
        }
        return (React.createElement("li", { key: msg.username + msg.timestamp }, displayMessage));
    });
}


/***/ }),

/***/ "./src/client/client-handler.ts":
/*!**************************************!*\
  !*** ./src/client/client-handler.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = __webpack_require__(/*! ../common/game-core/common */ "./src/common/game-core/common.ts");
const messages_1 = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
const util_1 = __webpack_require__(/*! ../server/lobby/util */ "./src/server/lobby/util.ts");
exports.socket = io('/lobby');
exports.clientSocket = exports.socket;
exports.socket.emit(messages_1.SOCKET_MSG.LOBBY_NUM_ONLINE);
function sendUsername(username) {
    exports.socket.emit(messages_1.SOCKET_MSG.LOBBY_CREATE_USER, { username: username });
}
exports.sendUsername = sendUsername;
function sendCreateRoom() {
    exports.socket.emit(messages_1.SOCKET_MSG.LOBBY_CREATE_ROOM);
}
exports.sendCreateRoom = sendCreateRoom;
function sendJoinRoom(roomId) {
    exports.socket.emit(messages_1.SOCKET_MSG.LOBBY_JOIN_ROOM, { roomId: roomId });
}
exports.sendJoinRoom = sendJoinRoom;
function sendStartGame() {
    exports.socket.emit(messages_1.SOCKET_MSG.START_GAME);
}
exports.sendStartGame = sendStartGame;
function sendChatMessage(msg) {
    exports.socket.emit(messages_1.SOCKET_MSG.CHAT_POST_MESSAGE, {
        message: msg,
        timestamp: new Date(),
    });
}
exports.sendChatMessage = sendChatMessage;
/* game */
function chooseCharacter(entProfileId) {
    exports.socket.emit(messages_1.SOCKET_MSG.PLAYER_DECISION, {
        phase: common_1.Phase.CHOOSE_CHARACTER,
        entityProfileId: entProfileId,
    });
}
exports.chooseCharacter = chooseCharacter;
function chooseStartingLane(laneId) {
    exports.socket.emit(messages_1.SOCKET_MSG.PLAYER_DECISION, {
        phase: common_1.Phase.CHOOSE_CHARACTER,
        startingLane: laneId,
    });
}
exports.chooseStartingLane = chooseStartingLane;
function chooseActionAndTarget(actionDef, targetId) {
    exports.socket.emit(messages_1.SOCKET_MSG.PLAYER_DECISION, {
        phase: common_1.Phase.CHOOSE_CHARACTER,
        actionId: actionDef.id,
        targetEntity: util_1.actionDefTargetsEntity(actionDef) ? targetId : undefined,
        targetLane: actionDef.target.what === common_1.TargetWhat.LANE ? targetId : undefined,
    });
}
exports.chooseActionAndTarget = chooseActionAndTarget;
// returns a function to turn off the handler.
// remember to SAVE that function and CALL it on the unmount.
function generateHandler(messageType, fn, errorFn) {
    var handler = (data) => {
        if (data['error'] === undefined) {
            fn(data);
        }
        else {
            console.warn('Error message: ' + data['error']);
            if (errorFn) {
                errorFn(data);
            }
        }
    };
    exports.socket.on(messageType, handler);
    var offCallback = () => {
        exports.socket.off(messageType, handler);
    };
    return offCallback;
}
exports.generateHandler = generateHandler;


/***/ }),

/***/ "./src/client/client.tsx":
/*!*******************************!*\
  !*** ./src/client/client.tsx ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const ReactDOM = __webpack_require__(/*! react-dom */ "react-dom");
const Views = __webpack_require__(/*! ./views */ "./src/client/views.tsx");
ReactDOM.render(React.createElement(Views.Views, null), document.getElementById('root'));


/***/ }),

/***/ "./src/client/game-ui/action-choices.tsx":
/*!***********************************************!*\
  !*** ./src/client/game-ui/action-choices.tsx ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const skills_1 = __webpack_require__(/*! ../../common/game-info/skills */ "./src/common/game-info/skills.ts");
class ActionChoices extends React.Component {
    constructor(props) {
        super(props);
        this.onSelectAction = this.onSelectAction.bind(this);
    }
    render() {
        return (React.createElement("div", { className: "choices" }, this.renderActionChoices(this.props.choices)));
    }
    onSelectAction(actionId) {
        this.props.onSelectAction(actionId);
    }
    renderActionChoices(choices) {
        return choices.map((actionId) => React.createElement(ActionChoicePanel, { key: actionId, def: skills_1.Skills[actionId], onSelect: this.onSelectAction, currentlySelected: this.props.currentChoiceActionDef && actionId === this.props.currentChoiceActionDef.id }));
    }
}
exports.ActionChoices = ActionChoices;
class ActionChoicePanel extends React.Component {
    constructor(props) {
        super(props);
        this.onSelect = this.onSelect.bind(this);
    }
    render() {
        return (React.createElement("div", { className: "choice-card " + (this.props.currentlySelected ? 'current-action-choice' : ''), onClick: this.onSelect },
            this.props.def.name,
            React.createElement("br", null),
            this.props.def.desc));
    }
    onSelect(e) {
        this.props.onSelect(this.props.def.id);
    }
}


/***/ }),

/***/ "./src/client/game-ui/character-choices.tsx":
/*!**************************************************!*\
  !*** ./src/client/game-ui/character-choices.tsx ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const characters_1 = __webpack_require__(/*! ../../common/game-info/characters */ "./src/common/game-info/characters.ts");
class CharacterChoices extends React.Component {
    constructor(props) {
        super(props);
        this.selectCharacter = this.selectCharacter.bind(this);
    }
    render() {
        return (React.createElement("div", { className: "choices" }, this.renderCharacterChoices(this.props.choices)));
    }
    renderCharacterChoices(choices) {
        return choices.map((entProfId) => React.createElement(CharacterChoicePanel, { key: entProfId, entProfile: characters_1.Characters[entProfId], onSelectCharacter: this.selectCharacter }));
    }
    selectCharacter(entProfId) {
        this.props.onSelectCharacter(entProfId);
    }
}
exports.CharacterChoices = CharacterChoices;
class CharacterChoicePanel extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    render() {
        return (React.createElement("div", { className: "choice-card", onClick: this.onClick },
            this.props.entProfile.name,
            React.createElement("br", null),
            "FACTION ",
            this.props.entProfile.faction,
            React.createElement("br", null),
            "HP ",
            this.props.entProfile.maxHp,
            React.createElement("br", null),
            "STR ",
            this.props.entProfile.str));
    }
    onClick(e) {
        this.props.onSelectCharacter(this.props.entProfile.id);
    }
}


/***/ }),

/***/ "./src/client/game-ui/entity-panel.tsx":
/*!*********************************************!*\
  !*** ./src/client/game-ui/entity-panel.tsx ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const characters_1 = __webpack_require__(/*! ../../common/game-info/characters */ "./src/common/game-info/characters.ts");
class EntityPanel extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    render() {
        var prof = characters_1.Characters[this.props.entity.profileId];
        if (prof.emptyProfile) {
            return null;
        }
        var image = prof.image;
        if (image) {
            image = 'images/' + image;
        }
        var selectableClass = this.props.selectable ? 'selectable' : '';
        var selectedClass = this.props.selected ? 'selected' : '';
        var teamClass = "entity-team-" + this.props.entity.team;
        return (React.createElement("div", { className: ['entity-panel', selectableClass, selectedClass, teamClass].join(' '), onClick: this.onClick },
            React.createElement("div", { className: "image-container" }, image ? React.createElement("img", { src: image }) : undefined),
            React.createElement("div", { className: "stats-container" },
                React.createElement("p", null,
                    "HP ",
                    this.props.entity.state.hp,
                    "/",
                    this.props.entity.state.maxHp),
                React.createElement("p", null,
                    "AP ",
                    this.props.entity.state.ap,
                    "/",
                    this.props.entity.state.maxAp))));
    }
    onClick() {
        this.props.onSelect(this.props.entity.id);
    }
}
exports.EntityPanel = EntityPanel;


/***/ }),

/***/ "./src/client/game-ui/lane.tsx":
/*!*************************************!*\
  !*** ./src/client/game-ui/lane.tsx ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const entity_panel_1 = __webpack_require__(/*! ./entity-panel */ "./src/client/game-ui/entity-panel.tsx");
class Lane extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    render() {
        var classes = ['lane', this.props.selectable ? 'selectable' : '', this.props.selected ? 'selected' : ''].join(' ');
        return (React.createElement("div", { id: "lane-" + this.props.id, className: classes, onClick: this.onClick },
            this.renderTeamEntities(1),
            this.renderTeamEntities(2)));
    }
    onClick(e) {
        if (this.props.selectable) {
            this.props.onSelect(this.props.id);
        }
    }
    renderTeamEntities(t) {
        return this.props.entities.filter((ent) => (ent.team === t))
            .map((ent) => {
            return (React.createElement(entity_panel_1.EntityPanel, { key: ent.id, entity: ent, selected: this.props.selectedEntityId === ent.id, selectable: this.props.entitiesSelectable, onSelect: this.props.onSelectEntity }));
        });
    }
}
exports.Lane = Lane;


/***/ }),

/***/ "./src/client/game-ui/team-panel.tsx":
/*!*******************************************!*\
  !*** ./src/client/game-ui/team-panel.tsx ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
class TeamPanel extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (React.createElement("div", { id: "team-panel-" + this.props.team, className: "team-panel" }, this.renderReady()));
    }
    renderReady() {
        var teamUsernames = this.props.matchState['team' + this.props.team];
        return teamUsernames.map((username) => {
            var ready = this.props.matchState.playersReady[username];
            return React.createElement("p", { key: username },
                username,
                ready ? " - READY!" : '');
        });
    }
}
exports.TeamPanel = TeamPanel;


/***/ }),

/***/ "./src/client/game-view.tsx":
/*!**********************************!*\
  !*** ./src/client/game-view.tsx ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const common_1 = __webpack_require__(/*! ../common/game-core/common */ "./src/common/game-core/common.ts");
const common_2 = __webpack_require__(/*! ../common/game-core/common */ "./src/common/game-core/common.ts");
const messages_1 = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
const Handler = __webpack_require__(/*! ./client-handler */ "./src/client/client-handler.ts");
const character_choices_1 = __webpack_require__(/*! ./game-ui/character-choices */ "./src/client/game-ui/character-choices.tsx");
const lane_1 = __webpack_require__(/*! ./game-ui/lane */ "./src/client/game-ui/lane.tsx");
const team_panel_1 = __webpack_require__(/*! ./game-ui/team-panel */ "./src/client/game-ui/team-panel.tsx");
const action_choices_1 = __webpack_require__(/*! ./game-ui/action-choices */ "./src/client/game-ui/action-choices.tsx");
const skills_1 = __webpack_require__(/*! ../common/game-info/skills */ "./src/common/game-info/skills.ts");
const util_1 = __webpack_require__(/*! ../server/lobby/util */ "./src/server/lobby/util.ts");
const event_interfaces_1 = __webpack_require__(/*! ../common/game-core/event-interfaces */ "./src/common/game-core/event-interfaces.ts");
var MenuState;
(function (MenuState) {
    MenuState[MenuState["CHOOSE_CHARACTER"] = 0] = "CHOOSE_CHARACTER";
    MenuState[MenuState["CHOOSE_STARTING_LANE"] = 1] = "CHOOSE_STARTING_LANE";
    MenuState[MenuState["CHOOSE_ACTION"] = 2] = "CHOOSE_ACTION";
    MenuState[MenuState["CHOOSE_TARGET"] = 3] = "CHOOSE_TARGET";
    MenuState[MenuState["WAITING"] = 4] = "WAITING";
    MenuState[MenuState["RESOLVING"] = 5] = "RESOLVING";
    MenuState[MenuState["GAME_OVER"] = 6] = "GAME_OVER";
})(MenuState = exports.MenuState || (exports.MenuState = {}));
class GameView extends React.Component {
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
        var han1 = Handler.generateHandler(messages_1.SOCKET_MSG.PLAYERS_READY, (data) => {
            this.setState({
                matchState: data.matchState,
            });
        });
        var han2 = Handler.generateHandler(messages_1.SOCKET_MSG.PROMPT_DECISION, (data) => {
            var newState;
            switch (data.phase) {
                case (common_2.Phase.CHOOSE_STARTING_LANE):
                    newState = MenuState.CHOOSE_STARTING_LANE;
                    break;
                case (common_2.Phase.PLAN):
                    if (this.myTurn()) {
                        newState = MenuState.CHOOSE_ACTION;
                    }
                    else {
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
        var han3 = Handler.generateHandler(messages_1.SOCKET_MSG.RESOLVE_ACTIONS, (data) => {
            console.log(event_interfaces_1.flatReport(this.state.matchState, data.causes));
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
        switch (this.state.matchState.phase) {
            case (common_2.Phase.CHOOSE_CHARACTER):
                innerView = (React.createElement("div", { id: "menu" },
                    React.createElement(character_choices_1.CharacterChoices, { choices: this.props.matchState.characterChoicesIds[this.props.username], onSelectCharacter: this.selectCharacterProfile })));
                break;
            case (common_2.Phase.CHOOSE_STARTING_LANE):
                break;
            case (common_2.Phase.PLAN):
                innerView = (React.createElement("div", { id: "menu" },
                    React.createElement(action_choices_1.ActionChoices, { choices: this.state.actionChoicesIds, currentChoiceActionDef: this.state.currentSelectedActionChoice, onSelectAction: this.selectAction })));
                break;
            case (common_2.Phase.RESOLVE):
                break;
            default:
                console.warn('Bad phase ' + this.state.matchState.phase);
        }
        var entitiesByLane = getEntitiesByLane(this.state.matchState);
        return (React.createElement("div", { id: "game-view" },
            React.createElement("div", { id: "game-prompt" }, this.getPrompt()),
            React.createElement(team_panel_1.TeamPanel, { matchState: this.state.matchState, team: 1 }),
            React.createElement(team_panel_1.TeamPanel, { matchState: this.state.matchState, team: 2 }),
            innerView,
            React.createElement("div", { id: "lanes-container" },
                React.createElement("div", { id: "lanes" }, entitiesByLane.map((ents, idx) => (React.createElement(lane_1.Lane, { key: idx, id: idx, onSelect: this.selectLane, selectable: this.lanesSelectable(), selected: this.state.currentSelectedLaneId === idx, entities: ents, entitiesSelectable: this.entitiesSelectable(), onSelectEntity: this.selectEntity, selectedEntityId: this.state.currentSelectedEntityId })))))));
    }
    lanesSelectable() {
        return this.state.menuState === MenuState.CHOOSE_STARTING_LANE
            || (this.myTurn() && this.state.menuState === MenuState.CHOOSE_TARGET && this.state.currentSelectedActionChoice.target.what === common_1.TargetWhat.LANE);
    }
    entitiesSelectable() {
        return this.myTurn()
            && this.state.menuState === MenuState.CHOOSE_TARGET
            && util_1.actionDefTargetsEntity(this.state.currentSelectedActionChoice);
    }
    getPrompt() {
        switch (this.state.menuState) {
            case (MenuState.CHOOSE_CHARACTER):
                return 'Choose a character.';
            case (MenuState.CHOOSE_STARTING_LANE):
                return 'Choose a starting lane.';
            case (MenuState.CHOOSE_ACTION):
                return 'Choose an action.';
            case (MenuState.CHOOSE_TARGET):
                let targ = this.lanesSelectable() ? 'lane' : 'entity';
                return 'Choose target ' + targ + '.';
            case (MenuState.WAITING):
                if (util_1.getActingTeam(this.state.matchState) === this.state.matchState.players[this.props.username].team) {
                    return 'Waiting for other players.';
                }
                return 'Waiting for opposing team.';
            case (MenuState.RESOLVING):
                return 'Resolving.';
            case (MenuState.GAME_OVER):
                return 'Game over!';
        }
    }
    selectCharacterProfile(entProfId) {
        Handler.chooseCharacter(entProfId);
        this.setState({ menuState: MenuState.WAITING });
    }
    selectLane(laneId) {
        switch (this.state.menuState) {
            case (MenuState.CHOOSE_STARTING_LANE):
                Handler.chooseStartingLane(laneId);
                this.setState({
                    currentSelectedLaneId: laneId,
                    menuState: MenuState.WAITING
                });
                break;
            case (MenuState.CHOOSE_TARGET):
                this.submitActionAndSetWaiting(laneId);
                this.setState({
                    currentSelectedLaneId: laneId,
                });
                break;
            default:
                throw new Error('bad menuState ' + this.state.menuState);
        }
    }
    selectAction(actionId) {
        if (this.myTurn() && [MenuState.CHOOSE_ACTION, MenuState.CHOOSE_TARGET].indexOf(this.state.menuState) !== -1) {
            let actionDef = skills_1.Skills[actionId];
            if (actionDef.target.what === common_1.TargetWhat.NONE) {
                this.submitActionAndSetWaiting(undefined);
                this.setState({
                    currentSelectedActionChoice: skills_1.Skills[actionId],
                });
            }
            else {
                this.setState({
                    currentSelectedActionChoice: skills_1.Skills[actionId],
                    menuState: MenuState.CHOOSE_TARGET,
                });
            }
        }
    }
    selectEntity(id) {
        if (this.state.menuState === MenuState.CHOOSE_TARGET) {
            this.submitActionAndSetWaiting(id);
            this.setState({
                currentSelectedEntityId: id,
            });
        }
    }
    submitActionAndSetWaiting(target) {
        Handler.chooseActionAndTarget(this.state.currentSelectedActionChoice, target);
        this.setState({
            menuState: MenuState.WAITING,
        });
    }
    myTurn() {
        return util_1.getActingTeam(this.state.matchState) === this.state.matchState.players[this.props.username].team;
    }
}
exports.GameView = GameView;
function getEntitiesByLane(ms) {
    var entities = ms.players;
    var res = [[], [], [], []];
    for (let username of Object.keys(ms.players)) {
        var ent = ms.players[username];
        var y = ent.state.y;
        res[y].push(ent);
    }
    return res;
}


/***/ }),

/***/ "./src/client/menu-views.tsx":
/*!***********************************!*\
  !*** ./src/client/menu-views.tsx ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const messages_1 = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
const validate_1 = __webpack_require__(/*! ../common/validate */ "./src/common/validate.ts");
const Handler = __webpack_require__(/*! ./client-handler */ "./src/client/client-handler.ts");
class UsernameView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.updateUsername = this.updateUsername.bind(this);
    }
    render() {
        return (React.createElement("div", { id: "username-entry", className: "lobby-menu" },
            React.createElement("form", { id: "username-form", onSubmit: this.onSubmit },
                React.createElement("label", { htmlFor: "username", id: "username-label" }, "Username"),
                React.createElement("br", null),
                React.createElement("input", { type: "text", id: "username-input", maxLength: validate_1.maxUsernameLength, value: this.state.username, onChange: this.updateUsername }),
                React.createElement("br", null),
                React.createElement("input", { type: "submit", id: "submit-btn", value: "Submit" }))));
    }
    updateUsername(e) {
        this.setState({
            username: e.target.value
        });
    }
    onSubmit(e) {
        var name = this.state.username;
        if (validate_1.validateUsername(name)) {
            Handler.sendUsername(name);
        }
        e.preventDefault();
    }
}
exports.UsernameView = UsernameView;
class RoomOptionsView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            joinRoomId: '',
            joinErr: undefined,
        };
        this.onSubmitCreate = this.onSubmitCreate.bind(this);
        this.onSubmitJoin = this.onSubmitJoin.bind(this);
        this.updateJoinRoomId = this.updateJoinRoomId.bind(this);
    }
    componentDidMount() {
        this.handlerOff = Handler.generateHandler(messages_1.SOCKET_MSG.LOBBY_JOIN_ROOM, (data) => {
            return;
        }, (data) => {
            this.setState({
                joinErr: data.error,
            });
        });
    }
    componentWillUnmount() {
        this.handlerOff();
    }
    render() {
        var showError = this.state.joinErr ? 'error' : 'hidden';
        return (React.createElement("div", { id: "room-options", className: "lobby-menu" },
            React.createElement("div", { id: "room-creation" },
                React.createElement("button", { type: "button", onClick: this.onSubmitCreate }, "Create a Room")),
            React.createElement("div", { id: "room-joining" },
                "Or, join a room. Enter room ID:",
                React.createElement("form", { id: "username-form", onSubmit: this.onSubmitJoin },
                    React.createElement("input", { type: "text", id: "join-room-id-input", minLength: 4, maxLength: 4, value: this.state.joinRoomId, onChange: this.updateJoinRoomId }),
                    React.createElement("br", null),
                    React.createElement("input", { type: "submit", id: "join-room-submit-btn", value: "Join" }),
                    React.createElement("div", { className: showError }, "Error: Room full or not found.")))));
    }
    updateJoinRoomId(e) {
        this.setState({
            joinRoomId: e.target.value
        });
        e.preventDefault();
    }
    onSubmitCreate(e) {
        Handler.sendCreateRoom();
        e.preventDefault();
    }
    onSubmitJoin(e) {
        Handler.sendJoinRoom(this.state.joinRoomId);
        e.preventDefault();
    }
}
exports.RoomOptionsView = RoomOptionsView;
class WaitingRoomView extends React.Component {
    constructor(props) {
        super(props);
        this.startGame = this.startGame.bind(this);
    }
    render() {
        return (React.createElement("div", { id: "waiting-room", className: "lobby-menu" },
            React.createElement("div", null, "Room ID:"),
            React.createElement("h1", null, this.props.roomId),
            React.createElement("br", null),
            React.createElement("div", null, "Waiting for players..."),
            React.createElement("div", null,
                "Current players:",
                React.createElement("ul", null, renderPlayersList(this.props.usernames))),
            React.createElement("button", { type: "button", id: "start-game-btn", onClick: this.startGame }, "Start Game")));
    }
    startGame() {
        Handler.sendStartGame();
    }
}
exports.WaitingRoomView = WaitingRoomView;
function renderPlayersList(usernames) {
    return usernames.map((name) => (React.createElement("li", { key: name }, name)));
}


/***/ }),

/***/ "./src/client/online-counter.tsx":
/*!***************************************!*\
  !*** ./src/client/online-counter.tsx ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const Messages = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
const Handler = __webpack_require__(/*! ./client-handler */ "./src/client/client-handler.ts");
class OnlineCounter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: '...',
        };
    }
    componentDidMount() {
        this.handlerOff = Handler.generateHandler(Messages.SOCKET_MSG.LOBBY_NUM_ONLINE, (data) => {
            this.setState({
                count: data.count
            });
        });
    }
    componentWillUnmount() {
        this.handlerOff();
    }
    render() {
        return (React.createElement("div", { id: "online-counter" },
            "Online: ",
            this.state.count));
    }
    updateCount(x) {
        this.setState({
            count: x
        });
    }
}
exports.OnlineCounter = OnlineCounter;


/***/ }),

/***/ "./src/client/views.tsx":
/*!******************************!*\
  !*** ./src/client/views.tsx ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "react");
const messages_1 = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
const chat_window_1 = __webpack_require__(/*! ./chat-window */ "./src/client/chat-window.tsx");
const Handler = __webpack_require__(/*! ./client-handler */ "./src/client/client-handler.ts");
const game_view_1 = __webpack_require__(/*! ./game-view */ "./src/client/game-view.tsx");
const menu_views_1 = __webpack_require__(/*! ./menu-views */ "./src/client/menu-views.tsx");
const online_counter_1 = __webpack_require__(/*! ./online-counter */ "./src/client/online-counter.tsx");
var VIEW;
(function (VIEW) {
    VIEW["USERNAME"] = "username-entry";
    VIEW["ROOM_OPTIONS"] = "room-options";
    VIEW["WAITING_ROOM"] = "waiting-room";
    VIEW["GAME"] = "game";
})(VIEW || (VIEW = {}));
class Views extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curView: VIEW.USERNAME,
            roomId: undefined,
            roomUsernames: undefined,
            myUsername: undefined,
            matchState: undefined,
        };
    }
    componentDidMount() {
        Handler.generateHandler(messages_1.SOCKET_MSG.LOBBY_CREATE_USER, (data) => {
            this.setState({
                myUsername: data.username,
            });
            this.setView(VIEW.ROOM_OPTIONS);
        });
        Handler.generateHandler(messages_1.SOCKET_MSG.LOBBY_CREATE_ROOM, (data) => {
            this.setState({
                roomId: data.roomId,
                roomUsernames: [this.state.myUsername],
            });
            this.setView(VIEW.WAITING_ROOM);
        });
        Handler.generateHandler(messages_1.SOCKET_MSG.LOBBY_JOIN_ROOM, (data) => {
            if (data.username === this.state.myUsername) {
                this.setState({
                    roomId: data.roomId,
                    roomUsernames: data.users,
                });
                switch (this.state.curView) {
                    case (VIEW.ROOM_OPTIONS):
                        this.setView(VIEW.WAITING_ROOM);
                        break;
                    case (VIEW.WAITING_ROOM):
                        break;
                    case (VIEW.GAME):
                        break;
                    default:
                        console.warn('Bad view: ' + this.state.curView);
                }
            }
        });
        Handler.generateHandler(messages_1.SOCKET_MSG.LOBBY_ROOM_USERS, (data) => {
            this.setState({
                roomUsernames: data.users,
            });
        });
        Handler.generateHandler(messages_1.SOCKET_MSG.START_GAME, (data) => {
            if (this.state.curView === VIEW.WAITING_ROOM) {
                var charChoices = data.characterChoiceIds;
                this.setState({
                    matchState: data.matchState,
                });
                this.setView(VIEW.GAME);
            }
            else {
                console.warn('Bad view: ' + this.state.curView);
            }
        });
    }
    render() {
        var showCounter;
        if (this.state.curView === VIEW.USERNAME || this.state.curView === VIEW.ROOM_OPTIONS) {
            showCounter = React.createElement(online_counter_1.OnlineCounter, null);
        }
        var showChat;
        if (this.state.curView === VIEW.WAITING_ROOM || this.state.curView === VIEW.GAME) {
            showChat = React.createElement(chat_window_1.ChatWindow, null);
        }
        return (React.createElement("div", { id: "view" },
            showCounter,
            showChat,
            this.getViewComponent()));
    }
    getViewComponent() {
        switch (this.state.curView) {
            case (VIEW.USERNAME):
                return (React.createElement(menu_views_1.UsernameView, null));
            case (VIEW.ROOM_OPTIONS):
                return (React.createElement(menu_views_1.RoomOptionsView, null));
            case (VIEW.WAITING_ROOM):
                return (React.createElement(menu_views_1.WaitingRoomView, { roomId: this.state.roomId, usernames: this.state.roomUsernames }));
            case (VIEW.GAME):
                return (React.createElement(game_view_1.GameView, { username: this.state.myUsername, matchState: this.state.matchState }));
            default:
                console.error('Bad view ' + this.state.curView);
        }
    }
    setView(view) {
        this.setState({
            curView: view
        });
    }
}
exports.Views = Views;


/***/ }),

/***/ "./src/common/game-core/common.ts":
/*!****************************************!*\
  !*** ./src/common/game-core/common.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(/*! ../../server/lobby/util */ "./src/server/lobby/util.ts");
exports.ROOM_SIZE = 4;
var Phase;
(function (Phase) {
    Phase[Phase["CHOOSE_CHARACTER"] = 0] = "CHOOSE_CHARACTER";
    Phase[Phase["CHOOSE_STARTING_LANE"] = 1] = "CHOOSE_STARTING_LANE";
    Phase[Phase["PLAN"] = 2] = "PLAN";
    Phase[Phase["RESOLVE"] = 3] = "RESOLVE";
    Phase[Phase["GAME_OVER"] = 4] = "GAME_OVER";
})(Phase = exports.Phase || (exports.Phase = {}));
var Faction;
(function (Faction) {
    Faction[Faction["FERALIST"] = 0] = "FERALIST";
    Faction[Faction["MOLTEN"] = 1] = "MOLTEN";
    Faction[Faction["ABERRANT"] = 2] = "ABERRANT";
    Faction[Faction["ETHER"] = 3] = "ETHER";
    Faction[Faction["KINDRED"] = 4] = "KINDRED";
    Faction[Faction["GLOOMER"] = 5] = "GLOOMER";
    Faction[Faction["NONE"] = 6] = "NONE";
})(Faction = exports.Faction || (exports.Faction = {}));
var TargetWhat;
(function (TargetWhat) {
    TargetWhat[TargetWhat["NONE"] = 0] = "NONE";
    TargetWhat[TargetWhat["ENTITY"] = 1] = "ENTITY";
    TargetWhat[TargetWhat["ALLY"] = 2] = "ALLY";
    TargetWhat[TargetWhat["ENEMY"] = 3] = "ENEMY";
    TargetWhat[TargetWhat["LANE"] = 4] = "LANE";
})(TargetWhat = exports.TargetWhat || (exports.TargetWhat = {}));
var TargetRange;
(function (TargetRange) {
    TargetRange[TargetRange["IN_LANE"] = 0] = "IN_LANE";
    TargetRange[TargetRange["NEARBY"] = 1] = "NEARBY";
    TargetRange[TargetRange["ANY"] = 2] = "ANY";
})(TargetRange = exports.TargetRange || (exports.TargetRange = {}));
class Lane {
    constructor(y) {
        this.y = y;
    }
    getRandomEntity(team) {
        var from = this['team' + team];
        return util_1.randItem(from);
    }
}
exports.Lane = Lane;


/***/ }),

/***/ "./src/common/game-core/event-interfaces.ts":
/*!**************************************************!*\
  !*** ./src/common/game-core/event-interfaces.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const skills_1 = __webpack_require__(/*! ../game-info/skills */ "./src/common/game-info/skills.ts");
const util_1 = __webpack_require__(/*! ../../server/lobby/util */ "./src/server/lobby/util.ts");
var TurnEventResultType;
(function (TurnEventResultType) {
    TurnEventResultType["NONE"] = "NONE";
    TurnEventResultType["HP_CHANGE"] = "HP_CHANGE";
    TurnEventResultType["GAIN_STEF"] = "GAIN_STEF";
    TurnEventResultType["LOSE_STEF"] = "LOSE_STEF";
    TurnEventResultType["DEATH"] = "DEATH";
    TurnEventResultType["RESPAWN"] = "RESPAWN";
    TurnEventResultType["AP_CHANGE"] = "AP_CHANGE";
    TurnEventResultType["CHANGE_LANE"] = "CHANGE_LANE";
})(TurnEventResultType = exports.TurnEventResultType || (exports.TurnEventResultType = {}));
exports.EventResultTexts = {
    'NONE': () => 'Nothing happened.',
    'HP_CHANGE': (result) => {
        if (result.value > 0) {
            return `${result.entityId} gains ${result.value} HP.`;
        }
        return `${result.entityId} loses ${result.value} HP.`;
    },
    'GAIN_STEF': undefined,
    'LOSE_STEF': undefined,
    'DEATH': (result) => `${result.entityId} dies.`,
    'RESPAWN': (result) => `${result.entityId} respawns.`,
    'AP_CHANGE': (result) => {
        if (result.value > 0) {
            return `${result.entityId} gains ${result.value} AP.`;
        }
        return `${result.entityId} loses ${Math.abs(result.value)} AP.`;
    },
    'CHANGE_LANE': (result) => {
        return ''; // `${result.entityId} moves to lane ${result.laneId}.`;
    },
};
function flatReport(ms, causes) {
    return causes.map((cause) => {
        return flatEvent(ms, cause);
    });
}
exports.flatReport = flatReport;
function flatEvent(ms, cause) {
    var actionDef = skills_1.Skills[cause.actionDefId];
    var ent = ms.players[cause.entityId];
    var tar;
    if (util_1.actionDefTargetsEntity(actionDef)) {
        tar = ms.phase[cause.targetId];
    }
    else {
        tar = ms.lanes[cause.targetId];
    }
    var lines = [actionDef.resultMessage(ent, tar)];
    for (let res of cause.results) {
        var line = exports.EventResultTexts[res.type](res);
        if (line) {
            lines.push(line);
        }
    }
    return lines;
}
exports.flatEvent = flatEvent;


/***/ }),

/***/ "./src/common/game-info/characters.ts":
/*!********************************************!*\
  !*** ./src/common/game-info/characters.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = __webpack_require__(/*! ../game-core/common */ "./src/common/game-core/common.ts");
exports.Characters = {
    UNKNOWN: {
        id: 'UNKNOWN',
        faction: undefined,
        name: 'UNKNOWN',
        maxHp: undefined,
        str: undefined,
        image: '',
        emptyProfile: true,
    },
    GENERIC_FER: {
        id: 'GENERIC_FER',
        faction: common_1.Faction.FERALIST,
        name: 'Generic Feralist',
        maxHp: 140,
        str: 20,
        image: 'feralist.png',
    },
    GENERIC_MOL: {
        id: 'GENERIC_MOL',
        faction: common_1.Faction.MOLTEN,
        name: 'Generic Molten',
        maxHp: 160,
        str: 20,
        image: 'molten.png',
    },
    GENERIC_ABE: {
        id: 'GENERIC_ABE',
        faction: common_1.Faction.ABERRANT,
        name: 'Generic Aberrant',
        maxHp: 175,
        str: 18,
        image: 'aberrant.png',
    },
    GENERIC_KIN: {
        id: 'GENERIC_KIN',
        faction: common_1.Faction.KINDRED,
        name: 'Generic Kindred',
        maxHp: 180,
        str: 18,
        image: 'kindred.png',
    },
    GENERIC_ETH: {
        id: 'GENERIC_ETH',
        faction: common_1.Faction.ETHER,
        name: 'Generic Ether',
        maxHp: 130,
        str: 20,
        image: 'ether.png',
    },
    GENERIC_GLO: {
        id: 'GENERIC_GLO',
        faction: common_1.Faction.GLOOMER,
        name: 'Generic Gloomer',
        maxHp: 140,
        str: 18,
        image: 'gloomer.png',
    },
    GENERIC_NONE: {
        id: 'GENERIC_NONE',
        faction: common_1.Faction.NONE,
        name: 'Neutralbot',
        maxHp: 160,
        str: 20,
        image: '',
        emptyProfile: true,
    },
};
exports.PlayableCharacters = {
    GENERIC_FER: exports.Characters.GENERIC_FER,
    GENERIC_MOL: exports.Characters.GENERIC_MOL,
    GENERIC_ABE: exports.Characters.GENERIC_ABE,
    GENERIC_KIN: exports.Characters.GENERIC_KIN,
    GENERIC_ETH: exports.Characters.GENERIC_ETH,
    GENERIC_GLO: exports.Characters.GENERIC_GLO,
};


/***/ }),

/***/ "./src/common/game-info/skills.ts":
/*!****************************************!*\
  !*** ./src/common/game-info/skills.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = __webpack_require__(/*! ../game-core/common */ "./src/common/game-core/common.ts");
exports.Skills = {
    'ATTACK': {
        id: 'ATTACK',
        active: true,
        faction: common_1.Faction.NONE,
        name: 'Attack',
        desc: 'Attack a nearby enemy.',
        keywords: [],
        target: {
            what: common_1.TargetWhat.ENEMY,
            range: common_1.TargetRange.NEARBY
        },
        fn: (match, userEntity, targetEntity) => {
            var results = [];
            results = results.concat(simpleAttack(match, userEntity, targetEntity));
            return { results: results };
        },
        resultMessage: (userEntity, targetEntity) => {
            return userEntity.id + ' attacks.';
        }
    },
    'MOVE': {
        id: 'MOVE',
        active: true,
        faction: common_1.Faction.NONE,
        name: 'Move',
        desc: 'Move to a nearby lane.',
        keywords: [],
        target: {
            what: common_1.TargetWhat.LANE,
            range: common_1.TargetRange.NEARBY
        },
        fn: (match, userEntity, targetLane) => {
            var results = [];
            results = results.concat(match.moveEntity(userEntity, targetLane, 1));
            return { results: results };
        },
        resultMessage: (userEntity, targetLane) => {
            return userEntity.id + ' moves to lane ' + targetLane.y + '.';
        }
    },
    'FLANK_ASSAULT': {
        id: 'FLANK_ASSAULT',
        active: true,
        faction: common_1.Faction.FERALIST,
        name: 'Flank Assault',
        desc: `Move to a nearby lane, then attack a random enemy in that lane.`,
        keywords: [],
        target: {
            what: common_1.TargetWhat.LANE,
            range: common_1.TargetRange.NEARBY
        },
        fn: (match, user, targetLane) => {
            var results = [];
            // TODO movement
            var targetEntity = targetLane.getRandomEntity(otherTeam(user.team));
            if (targetEntity) {
                results = results.concat(simpleAttack(match, user, targetEntity));
            }
            return { results: results };
        }
    }
};
function simpleAttack(match, attacker, target, stefs, damageMod) {
    var results = [];
    var damage;
    var str = attacker.curStr;
    if (damageMod) {
        damage = damageMod(attacker, target);
    }
    else {
        damage = str;
    }
    // TODO off-lane penalty
    // TODO armor
    results = results.concat(match.changeEntityHp(target, damage * -1));
    if (target.alive && stefs) {
        stefs.forEach((stef) => {
            results = results.concat(match.applyStef(target, stef.stefId, stef.duration, attacker));
        });
    }
    return results;
}
function otherTeam(x) {
    if (x === 1) {
        return 2;
    }
    if (x === 2) {
        return 1;
    }
    throw new Error('bad team');
}


/***/ }),

/***/ "./src/common/messages.ts":
/*!********************************!*\
  !*** ./src/common/messages.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SOCKET_MSG;
(function (SOCKET_MSG) {
    SOCKET_MSG["LOBBY_NUM_ONLINE"] = "LOBBY_NUM_ONLINE";
    SOCKET_MSG["LOBBY_CREATE_USER"] = "LOBBY_CREATE_USER";
    SOCKET_MSG["LOBBY_CREATE_ROOM"] = "LOBBY_CREATE_ROOM";
    SOCKET_MSG["LOBBY_JOIN_ROOM"] = "LOBBY_JOIN_ROOM";
    SOCKET_MSG["LOBBY_ROOM_USERS"] = "LOBBY_ROOM_USERS";
    SOCKET_MSG["CHAT_POST_MESSAGE"] = "CHAT_POST_MESSAGE";
    SOCKET_MSG["START_GAME"] = "START_GAME";
    SOCKET_MSG["PLAYER_DECISION"] = "PLAYER_DECISION";
    SOCKET_MSG["PLAYERS_READY"] = "PLAYERS_READY";
    SOCKET_MSG["PROMPT_DECISION"] = "PROMPT_DECISION";
    SOCKET_MSG["RESOLVE_ACTIONS"] = "RESOLVE_ACTIONS";
})(SOCKET_MSG = exports.SOCKET_MSG || (exports.SOCKET_MSG = {}));


/***/ }),

/***/ "./src/common/validate.ts":
/*!********************************!*\
  !*** ./src/common/validate.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.minUsernameLength = 2;
exports.maxUsernameLength = 12;
function validateUsername(str) {
    var regex = /^[a-zA-Z0-9]{2,12}$/;
    return regex.test(str);
}
exports.validateUsername = validateUsername;


/***/ }),

/***/ "./src/server/lobby/util.ts":
/*!**********************************!*\
  !*** ./src/server/lobby/util.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = __webpack_require__(/*! ../../common/game-core/common */ "./src/common/game-core/common.ts");
const ID_LENGTH = 4;
const CHARS = 'abcdefgh123456789'; // 0 is confusing
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
exports.randInt = randInt;
function randItem(arr) {
    if (arr.length === 0) {
        return undefined;
    }
    var idx = randInt(0, arr.length);
    return arr[idx];
}
exports.randItem = randItem;
function randChar(chars) {
    return chars.charAt(randInt(0, chars.length));
}
function makeId() {
    var id = '';
    for (let i = 0; i < ID_LENGTH; i++) {
        let char = randChar(CHARS);
        id += char;
    }
    return id; // TODO add prefix for debugging clarity
}
exports.makeId = makeId;
function shuffle(arr) {
    arr.sort(() => {
        return 0.5 - Math.random();
    });
}
exports.shuffle = shuffle;
function getActingTeam(ms) {
    if (ms.turn % 2 === 0) {
        return 2;
    }
    return 1;
}
exports.getActingTeam = getActingTeam;
function actionDefTargetsEntity(ad) {
    return [common_1.TargetWhat.ALLY, common_1.TargetWhat.ENEMY, common_1.TargetWhat.ENTITY].indexOf(ad.target.what) !== -1;
}
exports.actionDefTargetsEntity = actionDefTargetsEntity;


/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = React;

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ReactDOM;

/***/ })

/******/ });
//# sourceMappingURL=client.bundle.js.map