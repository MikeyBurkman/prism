
// A json streamer that is designed specifically to stream an array of objects.
// For instance, given the file [a, b, c,], where a, b, and c are aribtrarily-complex objects,
// the callback is called three times, for a, b, and c. Each object may contain other objects or arrays.

var fs = require('fs');
var Promise = require('bluebird');
var LDJSONStream = require('ld-jsonstream');

module.exports = function(file, onItem) {
	return new Promise(function(resolve, reject) {
		var jsonStream = new LDJSONStream();

		jsonStream.on('data', function(data) {
			onItem(data);
		});
		
		jsonStream.on('error', function(err) {
			reject(err);
		});

		jsonStream.on('end', function() {
			resolve();
		});

		fs.createReadStream(file).pipe(jsonStream);
	});
};
