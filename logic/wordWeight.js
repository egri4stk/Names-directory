var ww = {};

function getStringCodeWeight(dimension, str) {
	var codesArray = [];
	for (var i = 0; i < dimension; i++) {
		codesArray[i].push(str.charCodeAt(i));
	}
	var strCode;
	for (i = 1; i <= dimension; i++) {
		var code = codesArray[i - 1];
		var coefficient = ( code > 99) ? 1000 : 100;
	}
	strCode += code*(coefficient);
}