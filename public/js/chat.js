const socket = io();

const $messageForm = document.querySelector('#form-message');
const $messageFormButton = document.querySelector('#submit-button');
const $messageFormInput = document.querySelector('#message');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages')

const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message', message => {
	console.log(message);
	const html = Mustache.render($messageTemplate, {
		message
	});
	$messages.insertAdjacentHTML('beforeend', html);
});
socket.on('share-location', (url) => {
	const html = Mustache.render($locationTemplate, {
		url
	});
	$messages.insertAdjacentHTML('beforeend', html);
})

function onSubmitForm(e) {
	e.preventDefault();
	$messageFormButton.setAttribute('disabled', "disabled");

	const message = $messageFormInput.value;
	socket.emit('sendMessage', message, error => {
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();

		if (error) {
			return console.log(error);
		}
		console.log('message is delivered!');
	});
}

$messageForm.addEventListener('submit', onSubmitForm);

function sendLocation() {
	if (!navigator.geolocation) {
		return alert('geolocation not supported!');
	}

	$sendLocation.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition(position => {
		console.log(position);
		const long = position.coords.longitude;
		const lat = position.coords.latitude;
		socket.emit('send-location', { long, lat }, () => {
			$sendLocation.removeAttribute('disabled');
			console.log('location shared!');
		});
	});
}

$sendLocation.addEventListener('click', sendLocation);
