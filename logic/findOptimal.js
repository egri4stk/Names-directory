const config = require('../config.json');
const person = require('./../db/person.js');
const async = require('async');
const wordWeight = require('./../services/wordWeight.js');


function bordersRec(tree, db, finalCallback) {

	function getSingleRelativeBorder(length, n) {  // this function return potential border relative the length
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

	function getOptimaSurround(RelativeBorder, length, skip, tree, finalCallback) { //rec function, which return surround with optimal border
		let RealBorder = RelativeBorder + skip + tree.offset - 1;
		if (length === RelativeBorder) {
			finalCallback(null, {finalId: RealBorder, finalRelativeId: RelativeBorder});
			return;
		}
		let epsStep = Math.round(RelativeBorder * 0.1);
		epsStep = (epsStep < 1) ? 10 : epsStep;
		let lEps = epsStep;
		let rEps = epsStep;
		let lEpsMax = 3 * epsStep;
		let rEpsMax = (tree.level === 0) ? length - RelativeBorder - 1 : epsStep * 5;

		function preEpsCalc(i, lEps, rEps, callback) {  // rec subfunc with return EPS (left and right limits) for search optimal surround
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

			let leftW = wordWeight.getStringCodeWeight(tree.dimension, db[left].fullname);
			let rightW = wordWeight.getStringCodeWeight(tree.dimension, db[right].fullname);
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
			if (diff === 0) {
				if (lEps === lEpsMax - 1 && rEps === rEpsMax - 1) {
					callback(null, {lEps: lEps, rEps: rEps});
					return;
				}
				let newLEps = (lEps + epsStep < lEpsMax) ? lEps + epsStep : lEpsMax - 1;
				let newREps = (rEps + epsStep < rEpsMax) ? rEps + epsStep : rEpsMax - 1;
				if (i !== 0 && i % 5 === 0) {
					setTimeout(function () {
						preEpsCalc(i + 1, newLEps, newREps, callback);
					}, 0);
				} else {
					preEpsCalc(i + 1, newLEps, newREps, callback);
				}
			}
		}

		preEpsCalc(0, lEps, rEps, function (err, res) {
			if(err){
				finalCallback(err);
				console.log(err);
				return;
			}
			let lEps = res.lEps;
			let rEps = res.rEps;
			let offset = RealBorder - lEps;
			let limit = lEps + rEps + 1;
			let surround = person.getLimitOffset(db, limit, offset);
			let optimalId = wordWeight.optimalBorder(surround, tree.dimension);
			let finalId = RealBorder + (optimalId - lEps);
			let finalRelativeId = RelativeBorder + (optimalId - lEps);
			finalCallback(null, {finalId: finalId, finalRelativeId: finalRelativeId});
		});
	}

	function rec(i, length, n, skip) {
		if (length === 0 || n === 0 || length < 0) {
			finalCallback(null, tree);
			return;
		}
		let RelativeBorder = getSingleRelativeBorder(length, n);
		getOptimaSurround(RelativeBorder, length, skip, tree, function (err, res) {
			if (!err) {
				tree.borders.push(res.finalId);
				if (i !== 0 && i % 80 === 0) {
					setTimeout(function () {
						rec(i + 1, length - res.finalRelativeId, n - 1, skip + res.finalRelativeId);
					}, 0);
				} else {
					rec(i + 1, length - res.finalRelativeId, n - 1, skip + res.finalRelativeId);
				}
			}
			else {
				console.error(err);
				finalCallback(err);
			}
		});
	}

	let i = 0;
	rec(i, tree.length, tree.partsCount, 0);
}

module.exports = {
	rec: bordersRec
};