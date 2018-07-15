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
                message: data.username + ' started the game.',
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
const messages_1 = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
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
    exports.socket.emit(messages_1.SOCKET_MSG.CHOOSE_CHARACTER, {
        entityProfileId: entProfileId,
    });
}
exports.chooseCharacter = chooseCharacter;
// returns a function to turn off the handler.
// remember to SAVE that function and CALL it on the unmount.
function generateHandler(messageType, fn, errorFn) {
    var handler = (data) => {
        if (data.error === undefined) {
            fn(data);
        }
        else {
            if (errorFn) {
                errorFn(data);
            }
            else {
                console.warn('Unhandled error message: ' + data.error);
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
const Handler = __webpack_require__(/*! ../client-handler */ "./src/client/client-handler.ts");
class CharacterChoices extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (React.createElement("div", { className: "character-choices" }, renderCharacterChoices(this.props.choices)));
    }
}
exports.CharacterChoices = CharacterChoices;
function renderCharacterChoices(choices) {
    return choices.map((entProfId) => React.createElement(CharacterChoicePanel, { entProfile: characters_1.Characters[entProfId] }));
}
class CharacterChoicePanel extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    render() {
        return (React.createElement("div", { className: "character-choice", onClick: this.onClick },
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
        Handler.chooseCharacter(this.props.entProfile.id);
    }
}


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
class Lane extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (React.createElement("div", { id: "lane-" + this.props.id, className: "lane" }));
    }
}
exports.Lane = Lane;


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
const rule_interfaces_1 = __webpack_require__(/*! ../common/game-core/rule-interfaces */ "./src/common/game-core/rule-interfaces.ts");
const character_choices_1 = __webpack_require__(/*! ./game-ui/character-choices */ "./src/client/game-ui/character-choices.tsx");
const lane_1 = __webpack_require__(/*! ./game-ui/lane */ "./src/client/game-ui/lane.tsx");
class GameView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            matchState: this.props.matchState
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
        this.handlerOff();
    }
    render() {
        return (React.createElement("div", { id: "game-view" },
            React.createElement("div", { id: "game-prompt" }, this.getPrompt()),
            React.createElement(character_choices_1.CharacterChoices, { choices: this.props.matchState.characterChoicesIds[this.props.username] }),
            React.createElement("div", { id: "lanes" },
                React.createElement(lane_1.Lane, { id: 0 }),
                React.createElement(lane_1.Lane, { id: 1 }),
                React.createElement(lane_1.Lane, { id: 2 }),
                React.createElement(lane_1.Lane, { id: 3 }))));
    }
    getPrompt() {
        switch (this.state.matchState.phase) {
            case (rule_interfaces_1.Phase.CHOOSE_CHARACTER):
                return 'Choose a character.';
            case (rule_interfaces_1.Phase.PLAN):
                return 'Choose an action.';
            case (rule_interfaces_1.Phase.RESOLVE):
                return '';
            case (rule_interfaces_1.Phase.GAME_OVER):
                return 'Game over!';
        }
    }
}
exports.GameView = GameView;


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
const Handler = __webpack_require__(/*! ./client-handler */ "./src/client/client-handler.ts");
const menu_views_1 = __webpack_require__(/*! ./menu-views */ "./src/client/menu-views.tsx");
const online_counter_1 = __webpack_require__(/*! ./online-counter */ "./src/client/online-counter.tsx");
const game_view_1 = __webpack_require__(/*! ./game-view */ "./src/client/game-view.tsx");
const chat_window_1 = __webpack_require__(/*! ./chat-window */ "./src/client/chat-window.tsx");
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

/***/ "./src/common/game-core/rule-interfaces.ts":
/*!*************************************************!*\
  !*** ./src/common/game-core/rule-interfaces.ts ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOM_SIZE = 4;
var Phase;
(function (Phase) {
    Phase[Phase["CHOOSE_CHARACTER"] = 0] = "CHOOSE_CHARACTER";
    Phase[Phase["PLAN"] = 1] = "PLAN";
    Phase[Phase["RESOLVE"] = 2] = "RESOLVE";
    Phase[Phase["GAME_OVER"] = 3] = "GAME_OVER";
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


/***/ }),

/***/ "./src/common/game-info/characters.ts":
/*!********************************************!*\
  !*** ./src/common/game-info/characters.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const rule_interfaces_1 = __webpack_require__(/*! ../game-core/rule-interfaces */ "./src/common/game-core/rule-interfaces.ts");
exports.Characters = {
    UNKNOWN: {
        id: 'UNKNOWN',
        faction: undefined,
        name: 'UNKNOWN',
        maxHp: undefined,
        str: undefined
    },
    GENERIC_FER: {
        id: 'GENERIC_FER',
        faction: rule_interfaces_1.Faction.FERALIST,
        name: 'Generic Feralist',
        maxHp: 140,
        str: 20
    },
    GENERIC_MOL: {
        id: 'GENERIC_MOL',
        faction: rule_interfaces_1.Faction.MOLTEN,
        name: 'Generic Molten',
        maxHp: 160,
        str: 20
    },
    GENERIC_ABE: {
        id: 'GENERIC_ABE',
        faction: rule_interfaces_1.Faction.ABERRANT,
        name: 'Generic Aberrant',
        maxHp: 175,
        str: 18
    },
    GENERIC_KIN: {
        id: 'GENERIC_KIN',
        faction: rule_interfaces_1.Faction.KINDRED,
        name: 'Generic Kindred',
        maxHp: 180,
        str: 18
    },
    GENERIC_ETH: {
        id: 'GENERIC_ETH',
        faction: rule_interfaces_1.Faction.ETHER,
        name: 'Generic Ether',
        maxHp: 130,
        str: 20
    },
    GENERIC_GLO: {
        id: 'GENERIC_GLO',
        faction: rule_interfaces_1.Faction.GLOOMER,
        name: 'Generic Gloomer',
        maxHp: 140,
        str: 18
    },
    GENERIC_NONE: {
        id: 'GENERIC_NONE',
        faction: rule_interfaces_1.Faction.NONE,
        name: 'Neutralbot',
        maxHp: 160,
        str: 20
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
    SOCKET_MSG["CHOOSE_CHARACTER"] = "CHOOSE_CHARACTER";
    SOCKET_MSG["PLAYER_DECISION"] = "PLAYER_DECISION";
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