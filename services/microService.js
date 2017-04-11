const config = require('../config.json');

function setPartsCount(level) {
	return (config.levelCountArray[level]) ? config.levelCountArray[level] : config.levelCountArray[0];
}

module.exports = {
	setPartsCount: setPartsCount
};