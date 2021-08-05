module.exports = {
	generateMessage: function (text) {
		return {
			text,
			createdAt: new Date().getTime(),
		};
	},
};
