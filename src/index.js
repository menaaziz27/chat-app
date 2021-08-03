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

io.on('connection', () => {
	console.log('welcome a new connection');
});

server.listen(PORT, () => {
	`server is listening to port: PORT`;
});
