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
		return i === 0 ? RightPad(element, 4, 0) : LeftPad(element, 4, 0);
	});
	stringCodesArray.forEach(function (element) {
		strCode += element;
	});
	return Number(strCode);
}

function maxWithIndex(record, number, index) {
	return (number > record.max) ? {max: number, index: index} : record;
}

function absDif(dimension, str1, str2) {
	if (str1.length < dimension) {
		RightPad(str1, dimension, ' ');
	}
	if (str2.length < dimension) {
		RightPad(str2, dimension, ' ');
	}
	let difference = '';
	let differenceArr = [];
	for (let i = 0; i < dimension; i++) {
		let strCode1 = str1.charCodeAt(i);
		let strCode2 = str2.charCodeAt(i);
		differenceArr.push((strCode1 > 130 || strCode2 > 130) ? 0 : Math.abs(strCode1 - strCode2));
	}
	differenceArr.forEach(function (element, i) {
		difference += i === 0 ? RightPad(element, 3, 0) : LeftPad(element, 3, 0);
	});
	return Number(difference);
}

function optimalBorder(array, dimension) {
	return array.reduce(function (value, item, i, arr) {
		let difference = (i < arr.length - 1) ? absDif(dimension, item.fullname, arr[i + 1].fullname) : 0;
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