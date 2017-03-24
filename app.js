const app = require('./logic/namesTree');

app.start(function (err) {
	if(!err){
		console.log('SUCCESS');
		return;
	}
	console.log(err);
});


