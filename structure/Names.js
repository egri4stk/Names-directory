const config = require('../config.json');
const async = require('async');
const structure = require('./../logic/namesTree');
const microService = require('../services/microService');

let Names = class {
	constructor(length, offset, dimension, level) {
		this.length = length;
		this.offset = offset;
		this.dimension = dimension;
		this.level = level;
		this.name = (level === 0) ? 'root' : '';
		this.interval = '';
		this.elements = [];
		this.borders = [];
		this.partsCount = microService.setPartsCount(level);
		this.leftRightNames = {left: '', right: ''};
		this.leftRightIds = {left: 0, right: 0};
		this.persons = [];
	}

	setLeftRightIds() {
		this.leftRightIds = {left: this.offset, right: this.offset + this.length - 1};
	}

	setElements(db, array) {
		let self = this;
		array.forEach(function (item, i, coll) {
			let offset = (i === 0) ? self.offset : coll[i - 1] + 1;
			let length = (i === 0) ? item + 1 - offset : item - coll[i - 1];
			let children = new Names(length, offset, self.dimension + 1, self.level + 1);
			children.setLeftRightIds();
			children.setName();
			self.elements.push(children);
		});
		self.elements.forEach(function (element) {
			structure.getNamesOnLeftRight(db, element);
		});
	}

	setPartsCount(parts) {
		this.partsCount = parts;
	}

	setName() {
		if (this.level !== 0)
			this.name = `"${this.leftRightIds.left}--${this.leftRightIds.right}"`;
	}
};

module.exports = Names;
