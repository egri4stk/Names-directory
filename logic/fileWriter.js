const fs = require('fs');
const config = require('../config.json');

let writeObjectToFile = function (obj, path) {
	let str = JSON.stringify(obj);
	let stream = fs.createWriteStream(path);
	stream.once('open', function (fd) {
		stream.write(str);
		stream.end();
	});
};
exports.write = writeObjectToFile;