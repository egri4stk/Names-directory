const person = require('./person.js');
const config = require('../config.json');
const ww = require('./wordWeight.js');
const async = require('async');

function getPotentialBordersArray(length, n, callback) {
	let borders = [], size, i = 0;
	if (n < 2) {
		for (let i = 0; i < length; i++) {
			borders.push(i);
		}
	}
	if (length % n === 0) {
		size = Math.floor(length / n);
		while (i < length) {
			borders.push(i);
			i += size;
		}
	}
	else {
		while (i < length) {
			size = Math.ceil((length - i) / n--);
			borders.push(i);
			i += size;
		}
	}
	let endBorders = [];
	borders.forEach(function (element, i) {
		if (i !== 0) {
			endBorders.push(element - 1);
		}
	});
	endBorders.push(length-1);   //last border may be not release;
	callback(null, endBorders);
}


function getEpsFromConfig(dimension){
	switch (dimension) {
		case 2:
			return config.eps1;
			break;
		case 3:
			return config.eps2;
			break;
		default:
			return config.eps1;
	}
}


function getBordersRec(length, n, dimension, offset, callback) {
	let eps = getEpsFromConfig(dimension);
	let arr = [];
	let personsBorders = [];
	if (length === 0 || n === 0) {
		callback(null, {indexes: arr, info: personsBorders});
		return;
	}
	function borderRec(length, n, skip, arr, personsBorders, callback) {
		if (length <= 0 || n <= 0) {
			callback(null, {indexes: arr, info: personsBorders});
			return;
		}

		let a = getSingleBorder(length, n, offset);
		n--;
		if (n > 0) {
			getSurround(a + skip, eps, dimension, offset, function (err, result) {
				if (!err) {
					let optimalInfo = ww.optimalBorder(result.data, dimension);
					let optimalId = optimalInfo.index;
					personsBorders.push(optimalInfo.persons);
					a = a - result.eps + optimalId;
					length -= a;
					a += skip;
					arr.push(a);
					borderRec(length, n, a, arr, callback);
				}
			});
		}
		else {
			arr.push(a + skip - 1);
			borderRec(length, n, a, arr, callback);
		}
	}

	function getSingleBorder (length, n, skip) {
		if (n > length) {
			console.log('n > length. error');
			return length + skip;
		}
		if (n < 2) {
			return length + skip;
		}
		if (length % n === 0) {
			return Math.floor(length / n) + skip;
		}
		else {
			return Math.ceil(length / n) + skip;
		}
	}
	let a = getSingleBorder(length, n, offset); //first iteration
	getSurround(a, eps, dimension, offset, function (err, result) {
		if (!err) {
			let optimalInfo = ww.optimalBorder(result.data, dimension);
			let optimalId = optimalInfo.index;
			personsBorders.push(optimalInfo.persons);
			a = a - result.eps + optimalId;
			arr.push(a);
			borderRec(length - a, n - 1, a, arr, callback);
		}
	});
}

function preEpsCalc(id, eps, dimension, offset, callback) {
	let epsStep;
	switch (dimension) {
		case 2:
			epsStep = config.epsStep1;
			break;
		case 3:
			epsStep = config.epsStep2;
			break;
		default:
			epsStep = config.epsStep1;
	}
	let left = id - eps;
	let right = id + eps;
	if (left < 0) {
		callback('bad epssss');
		return;
	}
	async.series([
		function (callback) {
			person.getLimitOffset(1, left, callback)
		},
		function (callback) {
			person.getLimitOffset(1, right, callback)
		}
	], function (err, result) {
		if (err) {
			callback(err);
			return;
		}
		let left = ww.getStringCodeWeight(dimension, result[0][0].fullname);
		let right = ww.getStringCodeWeight(dimension, result[1][0].fullname);
		let diff = Math.abs(left - right);
		if (diff === 0) {
		//	console.log('diff = 0 ');
		}
		if (diff !== 0) {
			callback(null, eps);
			return;
		}

		eps += epsStep;
		if (offset !== 0 && eps >= offset) {
			callback(null, eps - epsStep);
			return;
		}
		preEpsCalc(id, eps, dimension, offset, callback);

	})
}

function getSurround(id, eps, dimension, offset, callback) {

	async.waterfall([
		function (callback) {
			preEpsCalc(id, eps, dimension, offset, function (err, res) {
				callback(err, res);
			});
		},
		function (newEpsDiff, callback) {
			eps = newEpsDiff;
			if (id - eps < 0) {
				console.log('wrong eps');
				callback('wrong eps');
				return;
			}
			let offset = id - eps;
			let limit = 2 * eps + 1;
			person.getLimitOffset(limit, offset, function (err, data) {
				if (!err) {
					let result = {data: data, eps: eps};
					callback(null, result);
					return;
				}
				console.log('error');
				callback('error');
			});
		}
	], function (err, result) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, result);
	});
}

function getCollectionDev(info, dimension) {
	let arr = info.indexes;
	let persons = info.info;

	let names = arr.map(function (element, i, arr) {
		let division = {};
		if (i === 0) {
			division.left = 0;
			division.right = element;
		}
		else {
			division.left = arr[i - 1] + 1;
			division.right = element;
		}
		return division;
	});
	let literals = [];

	persons.forEach(function (element, i, persons) {
		let interval = {};
		if (i === 0) {
			interval = ww.getIntervalName('AAAAAA', persons[i].last, dimension);
			literals.push(interval);
		}
		if (i === persons.length - 1) {
			interval = ww.getIntervalName(persons[i].new, 'WWWWWWW', dimension);
			literals.push(interval);
		}
		if (i !== 0 && i !== persons.length - 1) {
			interval = ww.getIntervalName(persons[i - 1].new, persons[i].last, dimension);
			literals.push(interval);
		}
	});
	return [names, literals];
}
function getSmartInfo(result) {
	console.log(result);
	let sortDiff = result.indexes.map(function (element, i, arr) {
		if (i !== 0) {
			return element - arr[i - 1];
		}
		return element;
	}).sort(function (a, b) {
		return a > b;
	});
	let maxDiff = sortDiff[sortDiff.length - 1] - sortDiff[0];
	console.log('result max diff: ' + maxDiff);
	// console.log(getCollectionDev(result, 2));
}

exports.getSmartInfo = getSmartInfo;
exports.getCollectionDev = getCollectionDev;
exports.getSurround = getSurround;
exports.getPotentialBordersArray = getPotentialBordersArray;
exports.getBordersRec = getBordersRec;