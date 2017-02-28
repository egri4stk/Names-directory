const db = require('./db.js').knex;
const config = require('../config.json');
const async = require('async');
const ww = require('./wordWeight');
const wc = require('./wordCollection');

exports.replaceSymbols = function (callback) {
	async.each(config.replacedSymbols, function (file, callback) {
		db.raw('UPDATE person_version SET surname = REPLACE(surname, "' + file + '", " "), name = REPLACE(name,"' + file + '", " ") WHERE surname like "%' + file + '%" or name like "%' + file + '%"')
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


function getDBLength(callback) {
	db('person_version').count('id as count').then(function (count) {
		callback(null, count[0].count);
	}).catch(function (err) {
		callback(err);
	});
}


exports.mainFunc = function (callback) {
	async.parallel([function (callback) {
		getAllPerson(callback);
	},
		function (callback) {
			async.waterfall([
				function (callback) {
					getDBLength(callback);
				},
				function (length, callback) {
					wc.getPotentialBordersArray(length, config.firstLevelLength, callback);
				}
			], function (err, result) {
				if (err) {
					callback(err);
					return;
				}
				callback(null, result);
			});
		}], function (err, results) {
		if (err) {
			callback(err);
			return;
		}
		let borders = results[1], collection = results[0];
		let surrounds = [];
		async.each(borders, function (element, callback) {
			wc.getEpsSurround(collection, element, config.eps, function (err, result) {
				if (err) {
					callback(err);
					return;
				}
				surrounds.push(result);
				callback();
			});
		}, function (err) {
			if (err) {
				callback(err);
				return;
			}
			let clearSurrounds = surrounds.map(function (element) {
				return element.map(function (element, i) {
					return element.fullname;
				})
			});
			let optimalBorders = clearSurrounds.map(function (element, i) {
				let indexPotentialBorder = (element.length - config.eps);
				let indexOptimalBorder = ww.optimalBorder(element, 2);
				let diff = indexOptimalBorder - indexPotentialBorder;
				return borders[i] - diff;
			});
			optimalBorders.push(collection.length);
			let answer = optimalBorders.map(function (element, i, arr) {
				let pair = [];
				if (i === 0) {
					pair = [0, element];
				}
				else {
					pair = [arr[i - 1] + 1, element]
				}
				return pair;
			});
			let literals = answer.map(function (element, i, arr) {
				let first = collection[element[0]].fullname;
				let second = (i === arr.length-1) ? collection[element[1]-1].fullname : collection[element[1]].fullname;
				let literal = ww.getIntervalName(first, second, 2);
				return literal;
			});
			callback(literals);
		});
	})

};