const config = require('../config.json');

function setPartsCount(level) {
	switch (level) {
		case 0:
			return config.levelCountArray[0];
			break;
		case 1:
			return config.levelCountArray[1];
			break;
		default:
			return config.levelCountArray[1];
	}
}

module.exports = {
	setPartsCount: setPartsCount
};