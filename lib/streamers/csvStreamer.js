
module.exports = {
	extImports: [
		'fs',
		'csv',
		'q'
	],
	init: init
};

function init(eggnog) {
	
	var fs = eggnog.import('fs');
	var csv = eggnog.import('csv');
	var q = eggnog.import('q');

	eggnog.exports = CsvStreamer;

	function CsvStreamer(file, callback) {

		var def = q.defer();

		var csvParser = csv.parse({columns: true});

		csvParser.on('readable', function(err, data) {
			if (err) {
				def.reject(err);
				return;
			}
			while(item = csvParser.read()){
				callback(item);
			}
		});

		csvParser.on('finish', function() {
			def.resolve();
		});

		fs.createReadStream(file).pipe(csvParser);

		return def.promise;
	}
}