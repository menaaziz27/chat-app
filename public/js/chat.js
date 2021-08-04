const socket = io();

socket.on('message', newMessage => {
	console.log(newMessage);
});

document.querySelector('#form-message').addEventListener('submit', e => {
	e.preventDefault();
	const message = document.querySelector('#message').value;
	socket.emit('sendMessage', message, error => {
		if (error) {
			return console.log(error);
		}
		console.log('message is delivered!');
	});
});

function sendLocation() {
	if (!navigator.geolocation) {
		return alert('geolocation not supported!');
	}

	navigator.geolocation.getCurrentPosition(position => {
		console.log(position);
		const long = position.coords.longitude;
		const lat = position.coords.latitude;
		socket.emit('send-location', { long, lat }, () => {
			console.log('location shared!');
		});
	});
}

document
	.querySelector('#send-location')
	.addEventListener('click', sendLocation);
