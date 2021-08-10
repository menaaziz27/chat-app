let typing = false;

const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormButton = document.querySelector('#submit-button');
const $messageFormInput = document.querySelector('#message-input');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

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
	removeLastChild();
});

function removeLastChild(child) {
	const lastChild = $messages.lastElementChild;
	console.log('remove last child');
	$messages.removeChild(lastChild);
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
	const message = $messageFormInput.value;
	updateTyping();
}

function updateTyping() {
	if (!typing) {
		typing = true;
		socket.emit('typing');
	}
	lastTypingTime = new Date().getTime();
	var timerLength = 3000;

	setTimeout(() => {
		var timeNow = new Date().getTime();
		var timeDiff = timeNow - lastTypingTime;

		if (timeDiff >= timerLength && typing) {
			socket.emit('stop typing');
			typing = false;
		}
	}, timerLength);
}

$messageFormInput.addEventListener('keydown', onTyping);
