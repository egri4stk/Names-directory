const fs = require('fs');
const config = require('../config.json');

let writeObjectToFile = function (obj, path,callback) {
	let str = JSON.stringify(obj,null,config.writeFileStyle);
	let stream = fs.createWriteStream(path);
	stream.write(str);
	stream.end();
	stream.on('finish',function () {
		callback();
	})
};
exports.write = writeObjectToFile;