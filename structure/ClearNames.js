let ClearNames = class {
	constructor(interval,persons){
		this.persons = persons;
		this.name = interval;
		this.elements = [];
	}

	setElements(elements) {
		let self = this;
		elements.forEach(function (element) {
			let children = new ClearNames(element.interval, element.persons);//, element.left, element.right);
			self.elements.push(children);
		})
	}
};

module.exports = ClearNames;