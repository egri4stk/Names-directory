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
	// endBorders.push(length);   last border may be not release;
	callback(null, endBorders);
}

function sliceArray(a, n, balanced) {
	if (n < 2)
		return [a];
	let len = a.length, out = [], indexes = [], i = 0, size;

	if (len % n === 0) {
		size = Math.floor(len / n);
		while (i < len) {
			out.push(a.slice(i, i += size));
		}
	}
	else if (balanced) {
		while (i < len) {
			size = Math.ceil((len - i) / n--);
			indexes.push(a[i]);
			out.push(a.slice(i, i += size));

		}
	}
	else {
		n--;
		size = Math.floor(len / n);
		if (len % size === 0)
			size--;
		while (i < size * n) {
			out.push(a.slice(i, i += size));
		}
		out.push(a.slice(size * n));
	}
	return {array: out, indexes: indexes};
}

function getEpsSurround(array, border, eps, callback) {
	if ((border - eps) < 0 || (border + eps + 1) > array.length) {
		callback('big eps');
	}
	callback(null, array.slice(border - eps, border + eps + 1));
}

exports.getPotentialBordersArray = getPotentialBordersArray;
exports.sliceArray = sliceArray;
exports.getEpsSurround = getEpsSurround;
