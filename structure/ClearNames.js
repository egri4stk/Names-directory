var uniqid = require('uniqid');
let ClearNames = class {
	constructor(interval,persons){
		this.persons = [];
		this.name = interval;
		this.intervalID = uniqid();
		this.elements = persons;
	}

	setElements(elements) {
		let self = this;
		elements.forEach(function (element,i) {
			let children = new ClearNames(element.interval, element.persons);
			self.elements.push(children);
		})
	}
};

module.exports = ClearNames;