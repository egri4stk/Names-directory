const db = require('./db.js').knex;
const config = require('../config.json');
const async = require('async');
const ww = require('./wordWeight');
const fw = require('./fileWriter');
const wc = require('./wordCollection');


exports.replaceSymbols = function (callback) {
	async.each(config.replacedSymbols, function (file, callback) {
		db.raw('UPDATE person_version SET surname = REPLACE(surname, "' + file + '", ""), name = REPLACE(name,"' + file + '", "") WHERE surname like "%' + file + '%" or name like "%' + file + '%"')
			.then(function () {
				console.log('update, replaced all ' + file);
				callback();
			})
			.catch(function (err) {
				callback(err);
			})
	}, function (err) {
		if (err) {
			callback(err);
			return;
		}
		callback('All was replaced!');
	});
};

function getAllPerson(callback) {
	db('person_version').select('id', 'fullname').orderBy('fullname')
		.then(function (data) {
			callback(null, data);
		})
		.catch(function (err) {
			callback(err);
		});
}

function getLimitOffset(limit, offset, callback) {
	db('person_version').select('id', 'fullname').orderBy('fullname').limit(limit).offset(offset)
		.then(function (data) {
			callback(null, data);
		})
		.catch(function (err) {
			callback(err);
		});
}
exports.getLimitOffset = getLimitOffset;


function getDBLength(callback) {
	db('person_version').count('id as count').then(function (count) {
		callback(null, count[0].count);
	}).catch(function (err) {
		callback(err);
	});
}


exports.func = function () {
	let arrBorder = [];
	async.waterfall([
		function (callback) {
			getDBLength(function (err, result) {
				callback(err, result);
			});
		},
		function (length, callback) {
			wc.getBordersRec(length, config.firstLevelLength, 2, 0, callback);
		}
	], function (err, result) {
		if (!err) {
			wc.getSmartInfo(result);

		// 			let nextLevelDivisions = result.indexes.map(function (item, i, arr) {
		// 		if (i !== 0) {
		// 			let offset = arr[i - 1];
		// 			return {
		// 				length: item - offset,
		// 				offset: offset + 1
		// 			}
		// 		}
		// 		else {
		// 			return {
		// 				length: item + 1,
		// 				offset: 0
		// 			}
		// 		}
		// 	});
		// 	console.log(nextLevelDivisions);
		//
		// 	async.each(nextLevelDivisions, function (index, callback) {
		// 		wc.getBordersRec(index.length, config.secondLevelLength, 3, index.offset, function (err, info) {
		// 			if (!err) {
		// 				arrBorder.push(info);
		// 			}
		//
		// 			callback(err, info);
		// 		})
		//
		// 	}, function (err) {
		// 		if (err) {
		// 			console.log(err);
		// 		}
		// 		let objAnsw = {arr: arrBorder};
		// 		fw.writeObjectToFile(objAnsw);
		// 	})
		}
	})
};

exports.getAllPerson = getAllPerson;
