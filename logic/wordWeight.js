function LeftPad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function RightPad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : n + new Array(width - n.length + 1).join(z);
}

function getStringCodeWeight(dimension, str) {
	let codesArray = [];
	for (let i = 0; i < dimension; i++) {
		codesArray.push(str.charCodeAt(i));
	}
	let strCode = '';
	let stringCodesArray = codesArray.map(function (element, i) {
		return i === 0 ? RightPad(element, 5, 0) : LeftPad(element, 5, 0);
	});
	stringCodesArray.forEach(function (element) {
		strCode += element;
	});
	return Number(strCode);
}

function absDif(a, b) {
	return Math.abs(a - b);
}

function maxWithIndex(record, number, index) {
	return (number > record.max) ? {max: number, index: index} : record;
}

function optimalBorder(array, dimension) {
	return array.reduce(function (value, item, i, arr) {
		let difference = (i < arr.length - 1) ? absDif(getStringCodeWeight(dimension, item.fullname), getStringCodeWeight(dimension, arr[i + 1].fullname)) : 0;
		return maxWithIndex(value, difference, i);
	}, {max: 0, index: 0}).index;

}

function getIntervalName(first, second, dimension) {
	return first.substring(0, dimension).toUpperCase() + '-' + second.substring(0, dimension).toUpperCase();
}


module.exports = {
	getStringCodeWeight: getStringCodeWeight,
	optimalBorder: optimalBorder,
	getIntervalName: getIntervalName
};