const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
	generateMessage,
	generateLocationMessage,
} = require('./utils/messages');

const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require('./utils/user');

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

	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		// usually we don't emmit immediately inside the on connection event but this made to welcome every single client
		socket.emit('message', generateMessage('Admin', 'Welcome!'));
		// an event that occur to all users except the one whoe does it
		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				generateMessage('Admin', `${user.username} has joined!`)
			);

		io.to(user.room).emit('roomData', {
			users: getUsersInRoom(user.room),
			room: user.room,
		});
		callback();
	});

	socket.on('typing', () => {
		const user = getUser(socket.id);

		socket.broadcast.to(user.room).emit('typing', user);
	});

	socket.on('stop typing', () => {
		const user = getUser(socket.id);
		socket.broadcast.to(user.room).emit('stop typing');
	});

	socket.on('sendMessage', (message, callback) => {
		const user = getUser(socket.id);

		if (!user) {
			return callback('no user found with this name!');
		}

		const filter = new Filter();
		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}
		io.to(user.room).emit('message', generateMessage(user.username, message));

		callback();
	});

	socket.on('send-location', (coords, callback) => {
		const user = getUser(socket.id);
		if (!user) {
			return callback('no user found!');
		}

		io.to(user.room).emit(
			'share-location',
			generateLocationMessage(
				user.username,
				`https://google.com/maps?q=${coords.lat},${coords.long}`
			)
		);
		callback();
	});

	socket.on('leave', () => {
		const user = getUser(socket.id);

		socket.emit('warning', user);
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				'message',
				generateMessage('Admin', `${user.username} has left!`)
			);
			io.to(user.room).emit('roomData', {
				users: getUsersInRoom(user.room),
				room: user.room,
			});
		}
	});
});

server.listen(PORT, () => {
	`server is listening to port: PORT`;
});

// socket.emit, io.emit, socket.broadcast.emit
// io.to.emit, socket.broadcast.to.emit
