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

exports.sel = function () {
	db('person_version').select('id').orderBy('fullname')
		.then(function (data) {
			console.log(data);
		})
		.catch(function (err) {
			console.log(err);
		});
};

function getDBLength(callback) {
	db('person_version').count('id as count').then(function (count) {
		callback(null, count[0].count);
	}).catch(function (err) {
		callback(err);
	});
}
exports.getDBLength = getDBLength;

exports.mainFunc = function (callback) {
	async.waterfall([
		function (callback) {
			getDBLength(callback);
		},
		function (length, callback) {
			wc.getPotentialBordersArray(length,100,callback);
		}
	], function (err, result) {
		if(err){
			callback(err);
			return;
		}
		callback(null,result);
	});
};