const ww = require('./wordWeight.js');
const config = require('../config.json');
const db = require('./../db/db.js');
const person = require('./../db/person.js');
const fw = require('./fileWriter.js');
const async = require('async');

/// START OF CLASS

class Names {
	constructor(length, offset, dimension, level) {
		function setPartsCount() {
			switch (level) {
				case 0:
					return config.levelCountArray[0];
					break;
				case 1:
					return config.levelCountArray[1];
					break;
				default:
					return config.levelCountArray[1];
			}
		}

		this.length = length;
		this.offset = offset;
		this.dimension = dimension;
		this.level = level;
		this.name = (level === 0) ? 'root' : '';
		this.interval = '';
		this.elements = [];
		this.borders = [];
		this.partsCount = setPartsCount();
		this.leftRightNames = {left: '', right: ''};
		this.leftRightIds = {left: 0, right: 0};
		this.persons = [];
	}

	setLeftRightIds() {
		this.leftRightIds = {left: this.offset, right: this.offset + this.length - 1};
	}

	setElements(array) {
		let self = this;
		async.series([
			function (callback) {
				array.forEach(function (item, i, coll) {
					let offset = (i === 0) ? self.offset : coll[i - 1] + 1;
					let length = (i === 0) ? item + 1 - offset : item - coll[i - 1];
					let children = new Names(length, offset, self.dimension + 1, self.level + 1);
					children.setLeftRightIds();
					children.setName();
					self.elements.push(children);
				});
				callback(null);
			},
			function (callback) {
				async.each(self.elements, function (element, callback) {
					getNamesOnLeftRight(element, callback);
				}, function (err) {
					callback(err);
				});
			}], function (err) {

		});
	}

	setName() {
		if (this.level !== 0)
			this.name = `"${this.leftRightIds.left}--${this.leftRightIds.right}"`;
	}
}

class ClearNames {
	constructor(interval, left, right) {
		this.ids = [];
		this.name = interval;
		this.left = left;
		this.right = right;
		this.elements = [];
	}

	setElements(elements) {
		let self = this;
		elements.forEach(function (element) {
			let children = new ClearNames(element.interval, element.left, element.right);
			self.elements.push(children);
		})
	}
}

/// END OF CLASS

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
			bordersRec(tree, function (err, tree) {
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

function bordersRec(tree, finalCallback) {
	function getSingleRelativeBorder(length, n) {
		if (n > length) {
			console.log('n > length. error');
			return length;
		}
		if (n < 2) {
			return length;
		}
		if (length % n === 0) {
			return Math.floor(length / n);
		}
		else {
			return Math.ceil(length / n);
		}
	}

	function getOptimaSurround(RelativeBorder, length, skip, tree, finalCallback) {
		let RealBorder = RelativeBorder + skip + tree.offset - 1;
		if (length === RelativeBorder) {
			finalCallback(null, {finalId: RealBorder, finalRelativeId: RelativeBorder});
			return;
		}
		let epsStep = Math.round(RelativeBorder * 0.02);
		epsStep = (epsStep < 10) ? 10 : epsStep;
		let lEps = epsStep, rEps = epsStep;
		let lEpsMax = Math.round(RelativeBorder * 0.35);
		let rEpsMax = length;


		function preEpsCalc(lEps, rEps, callback) {
			if (lEps < 0 || rEps < 0) {
				callback('lEps or rEps <0');
				return;
			}
			if (lEps > lEpsMax || rEps > rEpsMax) {
				callback('lEps or rEps out of the max');
				return;
			}
			let left = RealBorder - lEps;
			let right = RealBorder + rEps;
			if (left < 0) {
				callback('left < 0');
				return;
			}
			async.series([
				function (callback) {
					person.getLimitOffset(1, left, ['id', 'fullname'], callback)
				},
				function (callback) {
					person.getLimitOffset(1, right, ['id', 'fullname'], callback)
				}
			], function (err, result) {
				if (err) {
					callback(err);
					return;
				}
				let leftW = ww.getStringCodeWeight(tree.dimension, result[0][0].fullname);
				let rightW = ww.getStringCodeWeight(tree.dimension, result[1][0].fullname);
				let diff = Math.abs(leftW - rightW);
				if (diff !== 0) {
					callback(null, {lEps: lEps, rEps: rEps});
					return;
				}
				if (diff === 0 && lEps === lEpsMax && rEps === rEpsMax) {
					console.log('ATTENTION EPS MAX, AND DIFF = 0');
					callback(null, {lEps: lEps, rEps: rEps});
					return;
				}
				if (lEps + epsStep < lEpsMax) {
					lEps += epsStep;
				}
				else {
					lEps = lEpsMax;
				}
				if (rEps + epsStep < rEpsMax - 1) {
					rEps += epsStep;
				}
				else {
					rEps = rEpsMax - 1;
				}
				preEpsCalc(lEps, rEps, callback);
			})
		}

		async.waterfall([
			function (callback) {
				preEpsCalc(lEps, rEps, function (err, res) {
					callback(err, res);
				});
			},
			function (leftAndRightEps, callback) {
				let lEps = leftAndRightEps.lEps;
				let rEps = leftAndRightEps.rEps;
				let offset = RealBorder - lEps;
				let limit = lEps + rEps + 1;
				person.getLimitOffset(limit, offset, ['id', 'fullname'], function (err, data) {
					if (!err) {
						let result = {data: data, lEps: lEps, rEps: rEps};
						callback(null, result);
						return;
					}
					console.log('error');
					callback(err);
				});
			}
		], function (err, result) {
			if (!err) {
				let surround = result.data;
				let lEps = result.lEps;
				let optimalId = ww.optimalBorder(surround, tree.dimension);
				let finalId = RealBorder + (optimalId - lEps);
				let finalRelativeId = RelativeBorder + (optimalId - lEps);
				finalCallback(null, {finalId: finalId, finalRelativeId: finalRelativeId});
				return;
			}
			finalCallback(err);
		});
	}

	function rec(length, n, skip) {
		if (length === 0 || n === 0 || length < 0) {
			finalCallback(null, tree);
			return;
		}
		let RelativeBorder = getSingleRelativeBorder(length, n);
		getOptimaSurround(RelativeBorder, length, skip, tree, function (err, res) {
			if (!err) {
				tree.borders.push(res.finalId);
				rec(length - res.finalRelativeId, n - 1, skip + res.finalRelativeId);
			}
		});
	}

	rec(tree.length, tree.partsCount, 0);
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
			tree.interval = ww.getIntervalName(leftName, rightName, tree.dimension - 1);
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
						fw.write(clearTree, "obj.json", function (err) {
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










