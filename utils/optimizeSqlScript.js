const fs = require('fs');
const config = require('../config.json');
const fileWriter = require('./../services/fileWriter.js');

function readFile(path, arr, callback) {
	let lineReader = require('readline').createInterface({
		input: require('fs').createReadStream(path)
	});
	lineReader.on('line', function (line) {
		arr.push(line.slice(config.sliceFromSqlFile[0], config.sliceFromSqlFile[1]));
	});
	lineReader.on('close', function () {
		console.log('Reading file is complete');
		callback(null, arr);
	})
}

function createScriptSQL(arr) {
	let length = arr.length;
	let num = config.sqlInsertForOneTime;
	let finalStr = '';
	let count = Math.floor(length / num);
	let begin = config.sqlScriptBegin;

	for (let i = 0; i < count; i++) {
		finalStr += begin;
		for (let j = 0; j < num; j++) {
			finalStr += ' ' + arr[j + num * i];
			if (j !== num - 1) finalStr += ',';
		}
		finalStr += ';';
		finalStr += '\n';
	}
	for (let i = count * num; i < length; i++) {
		if (i === count * num) finalStr += begin;
		finalStr += ' ' + arr[i];
		if (i !== length - 1) finalStr += ',';
		if (i === length - 1) finalStr += ';';
	}
	return finalStr;
}

function optimizeSqlScript(callback) {
	readFile(config.pathToOriginalSqlScript, [], function (err, arr) {
		if (err) {
			console.error(err);
			callback(err);
			return;
		}
		fileWriter.write(createScriptSQL(arr), config.pathToNewSqlScript, function (err) {
			if (!err) {
				console.log('new SQL script ready!');
				callback(null);
				return;
			}
			callback(err);
		});
	});
}

module.exports = {
	optimizeSqlScript: optimizeSqlScript
};