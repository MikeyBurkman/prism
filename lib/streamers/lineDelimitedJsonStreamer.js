
// A json streamer that is designed specifically to stream an array of objects.
// For instance, given the file [a, b, c,], where a, b, and c are aribtrarily-complex objects,
// the callback is called three times, for a, b, and c. Each object may contain other objects or arrays.

module.exports = {
	extImports: [
		'fs',
		'q',
		'ld-jsonstream'
	],
	init: init
};

function init(eggnog) {

	var fs = eggnog.import('fs');
	var q = eggnog.import('q');
	var LDJSONStream = eggnog.import('ld-jsonstream');

	eggnog.exports = JsonStreamer;

	function JsonStreamer(file, callback) {

		var def = q.defer();

		var jsonStream = new LDJSONStream();

		jsonStream.on('data', function(data) {
			callback(data);
		});

		jsonStream.on('end', function() {
			def.resolve();
		});

		fs.createReadStream(file).pipe(jsonStream);

		return def.promise;
	}	
}
