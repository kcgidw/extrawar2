import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import { handleLobby } from './lobby/lobby-handler';

const app = express();
const httpServer = new http.Server(app);
const io = socketio(httpServer);
const port = process.env.PORT || 3000;

app.use(express.static('./public'));

httpServer.listen(port, function() {
	console.log('listening on *:' + port);
});

handleLobby(io);
