const config = require('../config.json');
const person = require('./../db/person.js');
const async = require('async');
const wordWeight = require('./../services/wordWeight.js');

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
				let leftW = wordWeight.getStringCodeWeight(tree.dimension, result[0][0].fullname);
				let rightW = wordWeight.getStringCodeWeight(tree.dimension, result[1][0].fullname);
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
				let optimalId = wordWeight.optimalBorder(surround, tree.dimension);
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


module.exports = {
	rec : bordersRec
};