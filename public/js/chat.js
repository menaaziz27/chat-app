const socket = io();

socket.on('message', newMessage => {
	console.log(newMessage);
});

document.querySelector('#form-message').addEventListener('submit', e => {
	e.preventDefault();
	const message = document.querySelector('#message').value;
	socket.emit('newMessage', message);
});
