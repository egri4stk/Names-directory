const fs = require('fs');
const config = require('../config.json');

function writeFile(obj, path, callback) {
	let str = (typeof obj === "object") ? JSON.stringify(obj, null, config.writeFileStyle) : obj;
	let stream = fs.createWriteStream(path);
	stream.write(str);
	stream.end();
	stream.on('finish', function () {
		console.log('Recorded in file');
		callback();
	})
}

module.exports = {
	write: writeFile
};
