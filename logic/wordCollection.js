function arrayStepDivided(array, count) {
	if (count > array.length)
		return;

	let step = Math.round(array.length / count);
	let stepIds = [];

	for (let i = 0; i < count; i++) {
		stepIds.push({element: array[i * step], id: i * step});
	}
	return stepIds;
}
exports.asd = arrayStepDivided;

