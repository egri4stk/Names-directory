const db = require('./db.js').db;
const pool = require('./db.js').pool;
const config = require('../config.json');
const async = require('async');

function getDB(params, callback) {
	pool.getConnection(function (err, connection) {
		if (err) {
			console.log(err);
			callback(err);
			return;
		}
		connection.query('SELECT ' + params + ' FROM person_version ORDER BY ' + config.orderByParam, function (err, res) {
			if (!err) {
				connection.release();
				callback(null, res);
				return;
			}
			callback(err);
			connection.release();
		})
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

function getDBLength(callback) {
	db('person_version').count('id as count').then(function (count) {
		callback(null, count[0].count);
	}).catch(function (err) {
		callback(err);
	});
}


module.exports = {
	getDBLength: getDBLength,
	getLimitOffset: getLimitOffset,
	replaceSymbols: replaceSymbols,
	getDB: getDB
};
