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

/***/ "./src/client/handler.ts":
/*!*******************************!*\
  !*** ./src/client/handler.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Msgs = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
const messages_1 = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
const socket = io('/lobby');
socket.emit(messages_1.SOCKET_MSG.LOBBY_NUM_ONLINE);
function onNumOnlineReceived(fn) {
    handleResponse(messages_1.SOCKET_MSG.LOBBY_NUM_ONLINE, fn);
}
exports.onNumOnlineReceived = onNumOnlineReceived;
function sendUsername(username) {
    socket.emit(messages_1.SOCKET_MSG.LOBBY_CREATE_USER, { username: username });
}
exports.sendUsername = sendUsername;
function onUsernameResponse(fn, errorFn) {
    handleResponse(messages_1.SOCKET_MSG.LOBBY_CREATE_USER, fn, errorFn);
}
exports.onUsernameResponse = onUsernameResponse;
function sendCreateRoom() {
    socket.emit(messages_1.SOCKET_MSG.LOBBY_CREATE_ROOM);
}
exports.sendCreateRoom = sendCreateRoom;
function onCreateRoomResponse(fn, errorFn) {
    handleResponse(messages_1.SOCKET_MSG.LOBBY_CREATE_ROOM, fn, errorFn);
}
exports.onCreateRoomResponse = onCreateRoomResponse;
function sendJoinRoom(roomId) {
    socket.emit(messages_1.SOCKET_MSG.LOBBY_JOIN_ROOM, { roomId: roomId });
}
exports.sendJoinRoom = sendJoinRoom;
function onJoinRoomResponse(fn, errorFn) {
    handleResponse(messages_1.SOCKET_MSG.LOBBY_JOIN_ROOM, fn, errorFn);
}
exports.onJoinRoomResponse = onJoinRoomResponse;
function sendChatMessage(msg) {
    socket.emit(messages_1.SOCKET_MSG.CHAT_POST_MESSAGE, { message: msg });
}
exports.sendChatMessage = sendChatMessage;
function handleResponse(messageType, fn, errorFn) {
    socket.on(messageType, (data) => {
        if (Msgs.isError(data)) {
            if (errorFn) {
                errorFn(data);
            }
            console.warn('Unhandled error message: ' + data.error);
        }
        else {
            fn(data);
        }
    });
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
const Handler = __webpack_require__(/*! ./handler */ "./src/client/handler.ts");
class OnlineCounter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: '...',
        };
    }
    componentDidMount() {
        Handler.onNumOnlineReceived((data) => {
            this.updateCount(data.count);
        });
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
const Handler = __webpack_require__(/*! ./handler */ "./src/client/handler.ts");
const validate_1 = __webpack_require__(/*! ../common/validate */ "./src/common/validate.ts");
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
        };
    }
    componentDidMount() {
        Handler.onUsernameResponse((data) => {
            this.setState({
                myUsername: data.username,
            });
            this.setView(VIEW.ROOM_OPTIONS);
        });
        Handler.onCreateRoomResponse((data) => {
            this.setState({
                roomId: data.roomId,
                roomUsernames: [this.state.myUsername],
            });
            this.setView(VIEW.WAITING_ROOM);
        });
        Handler.onJoinRoomResponse((data) => {
            this.setState({
                roomId: data.roomId,
                roomUsernames: data.users,
            });
            if (this.state.curView !== VIEW.WAITING_ROOM) {
                this.setView(VIEW.WAITING_ROOM);
            }
        });
    }
    render() {
        var showCounter;
        if (this.state.curView === VIEW.USERNAME || this.state.curView === VIEW.ROOM_OPTIONS) {
            showCounter = React.createElement(online_counter_1.OnlineCounter, null);
        }
        return (React.createElement("div", { id: "view" },
            showCounter,
            this.getViewComponent()));
    }
    getViewComponent() {
        switch (this.state.curView) {
            case (VIEW.USERNAME):
                return (React.createElement(UsernameView, null));
            case (VIEW.ROOM_OPTIONS):
                return (React.createElement(RoomOptionsView, null));
            case (VIEW.WAITING_ROOM):
                return (React.createElement(WaitingRoomView, { roomId: this.state.roomId, usernames: this.state.roomUsernames }));
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
        return (React.createElement("div", { id: "username-entry" },
            React.createElement("form", { id: "username-form", onSubmit: this.onSubmit },
                React.createElement("label", { htmlFor: "username" }, "Username"),
                React.createElement("input", { type: "text", id: "username", value: this.state.username, onChange: this.updateUsername }),
                React.createElement("input", { type: "submit", value: "Submit" }))));
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
class RoomOptionsView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            joinRoomId: '',
        };
        this.onSubmitCreate = this.onSubmitCreate.bind(this);
        this.onSubmitJoin = this.onSubmitJoin.bind(this);
        this.updateJoinRoomId = this.updateJoinRoomId.bind(this);
    }
    render() {
        return (React.createElement("div", { id: "room-options" },
            React.createElement("div", { id: "room-creation" },
                React.createElement("button", { type: "button", onClick: this.onSubmitCreate }, "Create a Room")),
            React.createElement("div", { id: "room-joining" },
                React.createElement("form", { id: "username-form", onSubmit: this.onSubmitJoin },
                    React.createElement("label", { htmlFor: "roomId" }, "Room ID"),
                    React.createElement("input", { type: "text", id: "roomId", value: this.state.joinRoomId, onChange: this.updateJoinRoomId }),
                    React.createElement("input", { type: "submit", value: "Join" })))));
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
class WaitingRoomView extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (React.createElement("div", { id: "waiting-room" },
            "Room ID: ",
            this.props.roomId,
            React.createElement("br", null),
            "Waiting for players...",
            React.createElement("br", null),
            "Current players:",
            React.createElement("ul", null, renderPlayersList(this.props.usernames))));
    }
}
function renderPlayersList(usernames) {
    return usernames.map((name) => (React.createElement("li", { key: name }, name)));
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
function isError(obj) {
    return obj instanceof Object && Object.keys(obj).length === 1 && obj['error'];
}
exports.isError = isError;
exports.SOCKET_MSG = {
    'LOBBY_NUM_ONLINE': 'LOBBY_NUM_ONLINE',
    'LOBBY_CREATE_USER': 'LOBBY_CREATE_USER',
    'LOBBY_CREATE_ROOM': 'LOBBY_CREATE_ROOM',
    'LOBBY_JOIN_ROOM': 'LOBBY_JOIN_ROOM',
    'CHAT_POST_MESSAGE': 'CHAT_POST_MESSAGE',
};


/***/ }),

/***/ "./src/common/validate.ts":
/*!********************************!*\
  !*** ./src/common/validate.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function validateUsername(str) {
    // alphanumeric, 3-12 chars
    var regex = /^[a-zA-Z0-9]{3,12}$/;
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