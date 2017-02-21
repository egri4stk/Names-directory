function getStringCodeWeight(dimension, str) {
	let codesArray = [];
	for (let i = 0; i < dimension; i++) {
		codesArray.push(str.charCodeAt(i));
	}
	let strCode = '';
	let stringCodesArray = codesArray.map(function (element) {
		return (element > 99) ? element.toString() : '0' + element.toString();
	});

	stringCodesArray.forEach(function (element) {
		strCode += element;
	});
	return Number(strCode);
}

function getArrayOfCodes(dimension, str) {
	let codesArray = [];
	for (let i = 0; i < dimension; i++) {
		codesArray.push(str.charCodeAt(i));
	}
	return codesArray;
}

function strInfo(dimension, str) {
	console.log(getStringCodeWeight(dimension, str), getArrayOfCodes(dimension, str))
}

function abs(a, b) {
	return Math.abs(a - b);
}

function maxWithIndex(record, number, index) {
	return (number > record.max) ? {max: number, index: index} : record;
}

exports.optimalBorder = function (array, dimension) {
	return array.reduce(function (value, item, i, arr) {
		let difference = (i < arr.length - 1) ? abs(getStringCodeWeight(dimension, item), getStringCodeWeight(dimension, arr[i + 1])) : 0;
		return maxWithIndex(value, difference, i);
	}, {max: 0, index: 0}).index;
};

exports.getIntervalName = function (first, second, dimension) {
	return first.substring(0, dimension).toUpperCase() + '-' + second.substring(0, dimension).toUpperCase();
};

