const app = require('./logic/structure');

app.start(function (err) {
	if(!err){
		console.log('SUCCESS');
		return;
	}
	console.log(err);
});


