const config = require('../config.json');
const fileWriter = require('./../services/fileWriter.js');
const async = require('async');
const person = require('./../db/person.js');
const wordWeight = require('./../services/wordWeight.js');
let Names = require('./../structure/Names');
let ClearNames = require('./../structure/ClearNames');
const findOptimal = require('./findOptimal');
const pool = require('../db/db').pool;
const getDb = require('../db/person').getDB;

function createRoot(callback) {   // this function create empty tree root
	person.getDBLength(function (err, length) {
		if (!err) {
			let tree = new Names(length, config.rootConfig.offset, config.rootConfig.dimension, config.rootConfig.level);
			callback(null, tree);
			return;
		}
		callback(err);
	})
}

function createNames(tree, db, callback) {   //this function fills empty tree element with borders and children (sub-elements)
	findOptimal.rec(tree, db, function (err, tree) {
		if (err) {
			console.error(err);
			callback(err);
			return;
		}
		tree.setElements(db, tree.borders);
		tree.setLeftRightIds();
		tree.setName();
		console.log(`created ${tree.name} ${getElementsDiff(tree)}`);
		callback(null, getNamesOnLeftRight(db, tree));
	});
}

function workWithFinishedTree(err, tree, db, mainCallback) { //final subfunction in main f
	if (err) {
		console.log(err);
		mainCallback(err);
		return;
	}
	tree.elements.forEach(function (item) {
		console.log(item.interval);
	});
	getPersonsForTree(db, tree, config.orderByParam, 0, function () {
		let clearTree = new ClearNames(tree.interval, tree.persons);
		createClearFullTree(tree, clearTree, 0, function () {
			fileWriter.write(clearTree, config.pathToAnswer, function (err) {
				if(err){
					mainCallback(err);
					return;
				}
				let intervals = {
					names : [],
					ids : []
				};

				clearTree.elements.forEach(function (item) {
					intervals.names.push(item.name);
					intervals.ids.push(item.intervalID);
				});
				fileWriter.write(intervals, config.pathToShortAnswer, function (err) {
					if (err) {
						mainCallback(err);
						return;
					}
					mainCallback();
				});
			});
		});
	});
}

function main(mainCallback) {  // this function returns full Names Tree
	getDb(['id','name','surname'], function (err, db) {
		if (err) {
			console.error(err);
			mainCallback(err);
			return;
		}
		console.log('get full db');
		async.waterfall([
			function (callback) { //create tree
				createRoot(callback);
			},
			function (root, callback) { // work with root, find roots elements
				createNames(root, db, callback)
			},
			function (tree, callback) {  //work with roots elements
				async.eachOf(tree.elements, function (file, iterate, callback) {
					createNames(file, db, callback);
				}, function (err) {
					if (err) {
						console.error(err);
						callback(err);
						return;
					}
					callback(null, tree);
				});
			}
		], function (err, tree) {
			workWithFinishedTree(err, tree, db, mainCallback);
		});
	});

}

function getElementsDiff(tree) {    // this function writes in console MAX and MIN subarray length
	let lengths = tree.elements.map(function (element) {
		return element.length;
	});
	lengths.sort(function (a, b) {
		return a - b;
	});
	return `\t MAX\\MIN: ${lengths[lengths.length - 1]} \\ ${lengths[0]}`;
}

function getNamesOnLeftRight(db, tree) {   //this function fills names on borders and fills elements with NAMES
	if (tree.interval === '') {
		if (tree.dimension === 2) {
			tree.interval = 'ROOT';
			return tree;
		}
		let leftName = db[tree.leftRightIds.left].fullname;
		let rightName = db[tree.leftRightIds.right].fullname;
		tree.leftRightNames = {left: leftName, right: rightName};
		tree.interval = wordWeight.getIntervalName(leftName, rightName, tree.dimension - 1);
		return tree;
	}
	else {
		return tree;
	}
}

function createClearFullTree(tree, clearTree, i, callback) {  //this function creates CLEAN tree (special for answer) without useless info
	if (tree.elements.length !== 0) {
		let clearElements = tree.elements.map(function (element) {
			return {interval: element.interval, persons: element.persons}
		});
		clearTree.setElements(clearElements);
		tree.elements.forEach(function (element, j) {
			if (i !== 0 && i % 50 === 0)
				setTimeout(function () {
					createClearFullTree(element, clearTree.elements[j], i + 1, callback);
				}, 0);
			else {
				createClearFullTree(element, clearTree.elements[j], i + 1, callback);
			}
			if (j === tree.elements.length - 1 && tree.dimension === 2) {
				setTimeout(function () {
					callback();
				}, 0);
			}
		});
	}
}

function getPersonsForTree(db, tree, property, i, callback) { //this function fills tree element with Person Info
	if (tree.elements.length !== 0) {
		tree.elements.forEach(function (element, j) {
			if (i !== 0 && i % 20 === 0) {
				setTimeout(function () {
					getPersonsForTree(db, element, property, i + 1, callback);
				}, 0);
			}
			else {
				getPersonsForTree(db, element, property, i + 1, callback);
			}
			if (tree.level === 0 && j === tree.elements.length - 1) {
				setTimeout(function () {
					callback();
				}, 0);
			}
		});
	}
	else {
		tree.persons = person.getLimitOffset(db, tree.leftRightIds.right - tree.leftRightIds.left, tree.leftRightIds.left).map(function (element) {
			switch (property) {
				case "id":
					return element.id;
					break;
				case "fullname":
					return element.fullname;
					break;
				default:
					return element.id;
			}
		});
	}
}



module.exports.start = main;
module.exports.getNamesOnLeftRight = getNamesOnLeftRight;









