
module.exports = {
	imports: [
		'streamers.csvStreamer',
		'streamers.lineDelimitedJsonStreamer'
	],
	init: init
};

function init(eggnog) {
	eggnog.exports = {
		load: loadFromSpec
	};

	var inputStreamers = {
		csv: eggnog.import('streamers.csvStreamer'),
		json: eggnog.import('streamers.lineDelimitedJsonStreamer')
	};

	function loadFromSpec(specModule) {
		var mapping = undefined;
		if (specModule.esMapping) {
			mapping = {
				properties: specModule.esMapping
			};
		}

		var inputStreamer = specModule.inputStreamer || fileExt(specModule.fileToParse);
		var streamer = inputStreamers[inputStreamer];
		if (!streamer) {
			throw 'Could not find streamer for format: [' + specModule.inputStreamer + ']';
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
		return filename.split('.').pop();
	}
}