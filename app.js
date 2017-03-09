const ww = require('./logic/wordWeight.js');
const wc = require('./logic/wordCollection.js');
const config = require('./config.json');
const db = require('./logic/db.js');
const person = require('./logic/person.js');

let ans = [];
let arr = [14, 24, 34, 44, 54, 64, 74, 84, 94, 654];
person.func();
person.getAllPerson(function (err, res) {
	if(!err){
	console.log('found');
	}
});



//[ 958, 1952, 2937, 3950, 4974, 5941, 6906, 7888, 8919, 10000 ]
//[ 958, 1952, 2937, 3950, 4974, 5941, 6906, 7888, 8919, 9999 ]
//[ 958, 1952, 2937, 3950, 4974, 5941, 6913, 7897, 8919, 9999 ]
//[ 958, 1952, 2937, 3950, 4974, 5941, 6893, 7887, 8919, 9999 ]