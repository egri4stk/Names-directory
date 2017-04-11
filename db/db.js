const config = require('../config.json');
const mysql = require('mysql');

let db = require('knex')({
	client: 'mysql',
	connection: {
		host: config.dbHost || '127.0.0.1',
		user: config.dbUser || 'root',
		password: config.dbPass || 'root',
		database: config.dbName || 'test'
	},
	pool: {min: 0, max: 10}
});

let pool = mysql.createPool({
	connectionLimit : 10,
	host: config.dbHost || '127.0.0.1',
	user: config.dbUser || 'root',
	password: config.dbPass || 'root',
	database: config.dbName || 'test'
});

exports.db = db;
exports.pool = pool;