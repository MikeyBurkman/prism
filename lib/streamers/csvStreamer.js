
var Promise = require('bluebird');
var fs = require('fs');
var csv = require('csv');

module.exports = function(file, onItem) {
	return new Promise(function(resolve, reject) {
		var csvParser = csv.parse({columns: true});

		csvParser.on('readable', function(err, data) {
			if (err) {
				reject(err);
				return;
			}
			
			while (item = csvParser.read()) {
				onItem(item);
			}
		});

		csvParser.on('finish', function() {
			resolve();
		});

		fs.createReadStream(file).pipe(csvParser);
	});
};