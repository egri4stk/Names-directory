const db = require('./db.js').db;
const config = require('../config.json');
const async = require('async');
const stringCleaning = require('../services/microService').stringCleaning;

function getDBandSort(params, callback) {
	console.log('Database is extracted, please wait');
	db(config.tableName).select(params)
		.then(function (db) {
			let newDB = db.map(function (element) {
				let fullname = (element.surname + ' ' + element.name).toLowerCase();
				return {id: element.id, fullname: stringCleaning(fullname,3)}
			});
			newDB.sort(function (a, b) {
				if (a.fullname === b.fullname) return 0;
				return (a.fullname < b.fullname) ? -1 : 1;
			});
			callback(null, newDB);
		}).catch(function (err) {
		callback(err);
	});
}



function getDBLength(callback) {
	db(config.tableName).count('id as count').then(function (count) {
		callback(null, count[0].count);
	}).catch(function (err) {
		callback(err);
	});
}

function replaceSymbols(callback) {
	async.each(config.replacedSymbols, function (file, callback) {
		db.raw('UPDATE '+config.tableName+' SET surname = REPLACE(surname, "' + file + '", ""), name = REPLACE(name,"' + file + '", "") WHERE surname like "%' + file + '%" or name like "%' + file + '%"')
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
	getDB: getDBandSort
};
