
var path = require('path');

var inputStreamers = {
	csv: require('../streamers/csvStreamer'),
 	json: require('../streamers/lineDelimitedJsonStreamer')
};

module.exports = function loadFromSpec(specModule) {
	var mapping = undefined;
	if (specModule.esMapping) {
		mapping = {
			properties: specModule.esMapping
		};
	}

	var inputStreamer = specModule.inputStreamer || fileExt(specModule.fileToParse);
	var streamer = inputStreamers[inputStreamer];
	if (!streamer) {
		throw 'Could not find streamer for format: [' + inputStreamer + ']';
	}

	return {
		file: specModule.fileToParse,
		streamer: streamer,
		esIndex: specModule.esIndex,
		esType: specModule.esType,
		batchSize: specModule.batchSize || 1000,
		transform: specModule.transform,
		filter: specModule.filter,
		mapping: mapping
	};
}

function fileExt(filename) {
	return path.extname(filename).slice(1);
}
