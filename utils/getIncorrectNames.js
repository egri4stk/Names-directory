const getDb = require('../db/person').getDB;
const config = require('../config.json');
const fileWriter = require('./../services/fileWriter.js');
const async = require('async');

function getStrType(dimension, str) {
	let strCodes = [];
	for (let i = 0; i < dimension; i++) {
		strCodes.push(str.charCodeAt(i));
	}
	if (strCodes[0] > 96 && strCodes[0] < 123) {
		let answer = config.strTypes.correct;
		for (let i = 0; i < dimension; i++) {
			if (strCodes[i] > 122) {
				answer = config.strTypes.otherIncorrect;
			}
		}
		return answer;
	}
	if (strCodes[0] < 97 || strCodes[0] > 122) {
		return config.strTypes.firstLiteralIncorrect;
	}
}

function specialToStringArray(arr) {
	let str = '';
	arr.forEach(function (element, i) {
		str += element;
		if (i !== arr.length - 1) str += '\n';
	});
	return str;
}

function getIncorrectNames(callback) {
	getDb(['fullname', 'id'], function (err, db) {
		if (err) {
			console.error(err);
			callback(err);
			return;
		}
		let incorrectArrays = {
			firstLiteralIncorrect: [],
			otherIncorrect: []
		};
		let incorrectIds = {
			firstLiteralIncorrect: [],
			otherIncorrect: []
		};
		db.forEach(function (element) {
			let str = element.fullname.toLowerCase();
			switch (getStrType(3, str)) {
				case config.strTypes.otherIncorrect :
					incorrectArrays.otherIncorrect.push(element);
					break;
				case config.strTypes.firstLiteralIncorrect :
					incorrectArrays.firstLiteralIncorrect.push(element);
					break;
				default:
					break;
			}
		});

		incorrectIds.firstLiteralIncorrect = incorrectArrays.firstLiteralIncorrect.map(function (item) {
			return item.id;
		});
		incorrectIds.otherIncorrect = incorrectArrays.otherIncorrect.map(function (item) {
			return item.id;
		});
		let allIncorrectIds = incorrectIds.firstLiteralIncorrect.concat(incorrectIds.otherIncorrect);

		async.parallel([
			function (callback) {
				fileWriter.write(incorrectArrays, 'incorrectPersons.json', function (err) {
					if (err) {
						console.log(err);
						callback(err);
						return;
					}
					callback();
				});
			},
			function (callback) {
				fileWriter.write(incorrectIds, 'incorrectIds.json', function (err) {
					if (err) {
						console.log(err);
						callback(err);
						return;
					}
					callback();
				});
			},
			function (callback) {
				fileWriter.write(specialToStringArray(allIncorrectIds), 'incorrectIds.txt', function (err) {
					if (err) {
						console.log(err);
						callback(err);
						return;
					}
					callback();
				});
			}
		], function (err) {
			callback(err);
		});
	})
}

module.exports = {
	getIncorrectNames: getIncorrectNames
};