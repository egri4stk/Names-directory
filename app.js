const app = require('./logic/namesTree');
const getIncorrectNames = require('./utils/getIncorrectNames');
const optimizeSqlScript = require('./utils/optimizeSqlScript').optimizeSqlScript;
const config = require('./config.json');

const appModes = config.appModes;
const appMode = appModes[config.appMode];


switch (appMode) {
	case appModes[0]:
		app.start(function (err) {
			if (!err) {
				console.log('SUCCESS');
				return;
			}
			console.log(err);
		});
		break;

	case appModes[1]:
		getIncorrectNames.getIncorrectNames(function (err) {
			if (!err) {
				console.log('get all incorrect');
				return;
			}
			console.log(err);
		});
		break;

	case appModes[2]:
		optimizeSqlScript(function (err) {
			if(!err){
				console.log('SUCCESS');
				return;
			}
			console.log(err);
		});
		break;

	default:
		app.start(function (err) {
			if (!err) {
				console.log('SUCCESS');
				return;
			}
			console.log(err);
		});
}


