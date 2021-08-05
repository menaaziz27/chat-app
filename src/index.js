const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

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
	console.log('welcome a new connection');

	socket.emit('message', 'hello client!');
	socket.broadcast.emit('message', 'new user joined');

	socket.on('newMessage', newMessage => {
		io.emit('message', newMessage);
	});

	socket.on('disconnect', () => {
		io.emit('message', 'a user has left!');
	});
});

server.listen(PORT, () => {
	`server is listening to port: PORT`;
});
