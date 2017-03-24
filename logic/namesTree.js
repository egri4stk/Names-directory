const config = require('../config.json');
const fileWriter = require('./../services/fileWriter.js');
const async = require('async');
const person = require('./../db/person.js');
const wordWeight = require('./../services/wordWeight.js');
let Names = require('./../structure/Names');
let ClearNames = require('./../structure/ClearNames');
const findOptimal = require('./findOptimal');

function createRoot(callback) {
	person.getDBLength(function (err, length) {
		if (!err) {
			let tree = new Names(length, config.rootConfig.offset, config.rootConfig.dimension, config.rootConfig.level);
			callback(null, tree);
			return;
		}
		callback(err);
	})
}

function createNames(tree, callback) {
	async.waterfall([
		function (callback) {
			findOptimal.rec(tree, function (err, tree) {
				if (!err) {
					tree.setElements(tree.borders);
					tree.setLeftRightIds();
					tree.setName();
					console.log(`created ${tree.name}`);
					callback(null, tree);
					return;
				}
				callback(err);
			});
		},
		function (tree, callback) {
			getNamesOnLeftRight(tree, callback)
		}
	], function (err, res) {
		if (!err) {
			callback(null, res);
			return;
		}
		callback(err);
	})
}

function getNamesOnLeftRight(tree, callback) {
	if (tree.interval === '') {
		if (tree.dimension === 2) {
			tree.interval = 'ROOT';
			callback(null, tree);
			return;
		}
		async.series([
			function (callback) {
				person.getLimitOffset(1, tree.leftRightIds.left, ['id', 'fullname'], callback)
			},
			function (callback) {
				person.getLimitOffset(1, tree.leftRightIds.right, ['id', 'fullname'], callback)
			}
		], function (err, result) {
			if (err) {
				callback(err);
				return;
			}
			let leftName = result[0][0].fullname;
			let rightName = result[1][0].fullname;
			tree.leftRightNames = {left: leftName, right: rightName};
			tree.interval = wordWeight.getIntervalName(leftName, rightName, tree.dimension - 1);
			callback(null, tree);
		});
	}
	else {
		callback(null, tree);
	}
}

function createClearFullTree(tree, clearTree) {
	if (tree.elements.length !== 0) {
		let clearElements = tree.elements.map(function (element) {
			return {interval: element.interval, left: element.leftRightIds.left, right: element.leftRightIds.right}
		});
		clearTree.setElements(clearElements);
		tree.elements.forEach(function (element, i) {
			createClearFullTree(element, clearTree.elements[i]);
		})
	}
	else return;
}

function getFinalIds(fullTree, callback) {
	async.waterfall([
		function (callback) {
			person.getLimitOffset(fullTree.right - fullTree.left + 1, fullTree.left, ['fullname'], function (err, res) {
				if (!err) {
					let clearArray = res.map(function (element) {
						return element.fullname;
					});
					callback(null, clearArray);
					return;
				}
				callback(err);
			})
		},
		function (ids, callback) {
			function recSlicer(tree) {
				if (tree.elements.length === 0) {
						tree.ids = ids.slice(tree.left, tree.right+1);
				}
				else{
					tree.elements.forEach(function (element) {
						recSlicer(element);
					})
				}
			}
			recSlicer(fullTree);
			callback(null,fullTree);
		}
	], function (err, res) {
		if (!err) {
			callback(null, res);
			return;
		}
		callback(err);
	});
}

function mainFunction(mainCallback) {
	createRoot(function (err, tree) {
		async.waterfall([function (callback) {
			createNames(tree, callback);
		}, function (tree, callback) {
			async.each(tree.elements, function (file, callback) {
				createNames(file, callback);
			}, function (err) {
				if (err) {
					callback(err);
					return;
				}
				callback(null, tree);
			});

		}], function (err, tree) {
			if (!err) {
				let clearTree = new ClearNames(tree.interval, tree.leftRightIds.left, tree.leftRightIds.right);
				createClearFullTree(tree, clearTree);
				getFinalIds(clearTree, function (err, res) {
					if(!err){
						fileWriter.write(clearTree, "obj.json", function (err) {
							mainCallback();
						});
					}
					else{
						mainCallback(err);
					}
				});
			}
		});
	});
}

module.exports.start = mainFunction;
module.exports.getNamesOnLeftRight = getNamesOnLeftRight;









