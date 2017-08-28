const config = require('../config.json');

function setPartsCount(level) {
	return (config.levelCountArray[level]) ? config.levelCountArray[level] : config.levelCountArray[0];
}

function stringCleaning(str, dimension){
	var symbols = '';
	for(var i=0; i< dimension; i++){
		var code = str.charCodeAt(i);
		if((65 <= code && code <= 90) || (97 <= code && code <= 122)) {
			symbols += str[i];
		}
	}
	return symbols + str.slice(dimension)
}

module.exports = {
	setPartsCount: setPartsCount,
	stringCleaning: stringCleaning
};