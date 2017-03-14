const fs = require('fs');
const config = require('../config.json');
const path = "names.txt";

let a = {name: 'Egor', age: 2055};


exports.writeObjectToFile = function (obj) {
	let str = JSON.stringify(obj);
	let stream = fs.createWriteStream(path);
	stream.once('open', function(fd) {
		stream.write(str);
		stream.end();
	});
};