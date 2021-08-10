let typing = false;
let timeout = undefined;

const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormButton = document.querySelector('#submit-button');
const $messageFormInput = document.querySelector('#message-input');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $typingMessage = document.getElementsByClassName('typing');
const $leaveBtn = document.querySelector('#leaveBtn');

const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-message-template')
	.innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
const $dotsTemplate = document.querySelector('#dots-template').innerHTML;

const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoscroll = () => {
	const $newMessage = $messages.lastElementChild;

	// height of the new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// visible height
	const visibleHeight = $messages.offsetHeight;

	// height of messages container
	const containerHeight = $messages.scrollHeight;

	// how far have i scrolled ?
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on('message', message => {
	console.log(message);
	const html = Mustache.render($messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a'),
	});

	// delete typing message if exists
	document.querySelectorAll('.typing').forEach(e => e.remove());

	// insert message text
	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('roomData', ({ users, room }) => {
	console.log(users, room);
	const html = Mustache.render($sidebarTemplate, {
		users,
		room,
	});
	document.querySelector('#sidebar').innerHTML = html;
});

socket.on('share-location', message => {
	const html = Mustache.render($locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('h:mm a'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('typing', userData => {
	const html = Mustache.render($dotsTemplate, {
		username: userData.username,
	});
	$messages.insertAdjacentHTML('beforeend', html);
});

socket.on('stop typing', () => {
	removeTypingMessage();
});

function removeTypingMessage() {
	console.log($typingMessage);
	$typingMessage[0]?.remove();
}

function onSubmitForm(e) {
	e.preventDefault();
	$messageFormButton.setAttribute('disabled', 'disabled');

	const message = $messageFormInput.value;
	socket.emit('sendMessage', message, error => {
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();

		if (error) {
			return alert('error');
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

socket.emit('join', { username, room }, error => {
	if (error) {
		alert('username is in use');
		location.href = '/';
	}
});

function onTyping(e) {
	updateTyping();
}

function timeoutFunction() {
	typing = false;
	socket.emit('stop typing');
}

let timeId;
function updateTyping() {
	if (typing == false) {
		typing = true;
		socket.emit('typing');
		timeout = setTimeout(timeoutFunction, 3000);
	} else {
		clearTimeout(timeout);
		timeout = setTimeout(timeoutFunction, 3000);
	}
}
socket.on('warning', user => {
	alert(`${user.username} are you sure you wanna leave the room?`);
});

function leaveBtnHandler(e) {
	console.log('leave now');
	const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
	if (leaveRoom) {
		window.location = '/';
	}
}
$leaveBtn.addEventListener('click', leaveBtnHandler);

$messageFormInput.addEventListener('keydown', onTyping);
