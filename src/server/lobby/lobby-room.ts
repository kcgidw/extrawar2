import * as SocketIO from 'socket.io';
import { GameRoom } from '../game-room/game-room';

export interface LobbyRoom extends SocketIO.Namespace {
	gameRoom: GameRoom;
}
