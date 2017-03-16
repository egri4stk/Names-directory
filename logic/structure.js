const ww = require('./wordWeight.js');
const wc = require('./wordCollection.js');
const config = require('../config.json');
const db = require('./db.js');
const person = require('./person.js');
const fw = require('./fileWriter.js');
const async = require('async');

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
		this.elements = [];
		this.borders = [];
		this.partsCount = setPartsCount();
		this.leftRightNames = {left: '', right: ''};
		this.leftRightIds = {left: 0, right: 0};
	}

	print() {
		console.log('hello' + this.name + this.elements);
	}

	setLeftRightIds() {
		this.leftRightIds = {left: this.offset, right: this.offset + this.length - 1};
	}

	setElements(array) {
		let self = this;

		array.forEach(function (item, i, coll) {
			let offset = (i === 0) ? self.offset : coll[i - 1] + 1;
			let length = (i === 0) ? item + 1 - offset : item - coll[i - 1];
			let children = new Names(length, offset, self.dimension + 1, self.level + 1);
			children.setLeftRightIds();
			children.setName();
			self.elements.push(children);
		});
	}

	setName() {
		if (this.level !== 0)
			this.name = `"${this.leftRightIds.left}--${this.leftRightIds.right}"`;
	}
}

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

function createNames(root) {
	bordersRec(root);
	root.setElements(root.borders);
	root.setLeftRightIds();
	root.setName();
	 console.log(`created ${root.name}`);
}

function bordersRec(tree) {
	function getSingleRelativeBorder(length, n) {
		if (n > length) {
			console.log('n > length. error');
			return length ;
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

	function rec(length, n, skip) {
		if (length === 0 || n === 0 || length < 0) {
			return;
		}

		let RelativeBorder = getSingleRelativeBorder(length, n);
		let RealBorder = RelativeBorder +skip + tree.offset - 1;

		tree.borders.push(RealBorder);
		rec(length - RelativeBorder, n - 1, skip + RelativeBorder);
	}

	rec(tree.length, tree.partsCount, 0);
}

createRoot(function (err, tree) {
	createNames(tree);
	tree.elements.forEach(function (element) {
		createNames(element);
	});
	console.log('END');
	wc.getPotentialBordersArray(tree.length, tree.partsCount, function (err, res) {
		for(let i=0; i<res.length; i++){
			if(res[i]!==tree.borders[i]){
				console.log(res[i]+ ' !== ' +tree.borders[i])
			}
		}
	});
});








