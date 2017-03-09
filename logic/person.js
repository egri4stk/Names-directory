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
		wc.getBordersRec(length,config.firstLevelLength,2,callback);
		}
	], function (err, result) {
		if(!err){
			wc.getSmartInfo(result);
		}
	})
};

exports.getAllPerson = getAllPerson;
