const ww = require('./logic/wordWeight.js');
const wc = require('./logic/wordCollection.js');
const config = require('./config.json');
const db = require('./logic/db.js');
const person = require('./logic/person.js');

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 4];

person.mainFunc(function (err, result) {
	if (err) {
		console.log(err);
		return;
	}
	console.log(result);
});

