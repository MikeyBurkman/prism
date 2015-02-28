
// Given a file, return a promise that resolves to a count of the lines in the file

module.exports = {
	extImports: [
		'line-by-line',
		'q'
	],
	init: init
}

function init(eggnog) {
	var LineReader = eggnog.import('line-by-line');
	var q = eggnog.import('q');

	eggnog.exports = {
		read: read
	};

	function read(file) {
		var def = q.defer();
		var count = 0;

		var lr = new LineReader(file);

		lr.on('error', function (err) {
		    def.reject(err);
		});

		lr.on('line', function () {
			count += 1;
		});

		lr.on('end', function () {
			def.resolve(count);
		});

		return def.promise;
	}
}