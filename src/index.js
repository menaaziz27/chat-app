const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
	generateMessage,
	generateLocationMessage,
} = require('./utils/messages');

const PORT = 8080;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));

app.get('/', (req, res, next) => {
	res.render('index.html');
});

io.on('connection', socket => {
	console.log('New WebSocket connection');

	// usually we don't emmit immediately inside the on connection event but this made to welcome every single client
	socket.emit('message', generateMessage('Welcome!'));
	// an event that occur to all users except the one whoe does it
	socket.broadcast.emit('message', generateMessage('A new user has joined!'));

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();
		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}
		io.emit('message', generateMessage(message));
		callback();
	});

	socket.on('send-location', (coords, callback) => {
		io.emit(
			'share-location',
			generateLocationMessage(
				`https://google.com/maps?q=${coords.lat},${coords.long}`
			)
		);
		callback();
	});
	socket.on('disconnect', () => {
		io.emit('message', generateMessage('A user has left!'));
	});
});

server.listen(PORT, () => {
	`server is listening to port: PORT`;
});
