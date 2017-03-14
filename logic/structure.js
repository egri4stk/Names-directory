const ww = require('./wordWeight.js');
const wc = require('./wordCollection.js');
const config = require('../config.json');
const db = require('./db.js');
const person = require('./person.js');
const fw = require('./fileWriter.js');

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
		this.partsCount = setPartsCount();
		this.bordersNames = {left: '', right: ''};
		this.bordersIds = {left: 0, right: 0};
	}

	print() {
		console.log('hello' + this.name + this.elements);
	}

	set lo(value) {
		[this.length, this.level] = value.split(' ');
	}

	setBorders() {
		this.bordersIds = {left: this.offset, right: this.offset + this.length - 1};
	}

	setElements(array) {
		let self = this;

		array.forEach(function(item, i, coll) {
			let length = (i === 0) ? item + 1 : item - coll[i - 1];
			let offset = (i === 0) ? 0 : coll[i - 1] + 1;
			let children = new Names(length, offset, self.dimension+1, self.level+1);
			children.setBorders();
			self.elements.push(children);
		});
	}
}

let tree = new Names(10000, 0, 2, 0);
wc.getPotentialBordersArray(tree.length, tree.partsCount, function (err, res) {
	tree.setElements(res);
});
console.log(tree.elements);

