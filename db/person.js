const db = require('./db.js').db;
const config = require('../config.json');
const async = require('async');

function getDB(params, callback) {
	db('person_version').select(params).orderBy(config.orderByParam).then(function (db) {
		callback(null, db);
	}).catch(function (err) {
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

function replaceSymbols(callback) {
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
		console.log('All symbols replaced');
		callback();
	});
}

function getLimitOffset(db, limit, offset) {
	return db.slice(offset, offset + limit);
}


module.exports = {
	getDBLength: getDBLength,
	getLimitOffset: getLimitOffset,
	replaceSymbols: replaceSymbols,
	getDB: getDB
};
