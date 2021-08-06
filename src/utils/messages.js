module.exports = {
	generateMessage: function (text) {
		return {
			text,
			createdAt: new Date().getTime(),
		};
	},
	generateLocationMessage: function (url) {
		return {
			url,
			createdAt: new Date().getTime(),
		};
	},
};
