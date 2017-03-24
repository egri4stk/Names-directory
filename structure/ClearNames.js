let ClearNames = class {
	constructor(interval, left, right) {
		this.ids = [];
		this.name = interval;
		this.left = left;
		this.right = right;
		this.elements = [];
	}

	setElements(elements) {
		let self = this;
		elements.forEach(function (element) {
			let children = new ClearNames(element.interval, element.left, element.right);
			self.elements.push(children);
		})
	}
};

module.exports = ClearNames;