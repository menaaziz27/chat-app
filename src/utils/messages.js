module.exports = {
	generateMessage: function (username, text) {
		return {
			username,
			text,
			createdAt: new Date().getTime(),
		};
	},
	generateLocationMessage: function (username, url) {
		return {
			username,
			url,
			createdAt: new Date().getTime(),
		};
	},
};
