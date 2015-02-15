
module.exports = {
	imports: [
		'es.client',
		'utils.batcher',
		'utils.workQueue'
	],
	extImports: [
		'q'
	],
	init: init
};

function init(eggnog) {

	var q = eggnog.import('q');
	var EsClient = eggnog.import('es.client');
	var Batcher = eggnog.import('utils.batcher');
	var workQueue = eggnog.import('utils.workQueue');

	eggnog.exports = function(spec, esClientConfig) {

		var ret = q.defer();

		var client = new EsClient(spec, esClientConfig);

		var streamer = spec.streamer;
		var batchSize = spec.batchSize;
		var transform = spec.transform || function(x) { return x; };
		var filter = spec.filter || function() { return true; };

		// Number of processing batches. Used to tell when we're done
		var numProcessing = 0;

		var queue = workQueue({
			callback: function(items, batchId) {
				var beginIndex = (batchId-1)*batchSize;
				var endIndex =(batchId*batchSize) - (batchSize - items.length);
				console.log('Processing [', beginIndex, ' - ', endIndex, ']');

				return client.indexItems(items)
					.then(function() {
						// success
						numProcessing -= 1;
						if (numProcessing == 0) {
							console.log('Finished processing!');
							ret.resolve();
						}
					}).catch(function(err) {
						ret.reject(err);
					});
			}
		});

		var batcher = new Batcher(batchSize, function(items, batchId) {
			numProcessing += 1;
			queue.push(items, batchId);
		});

		// Start csv scanning, which will pipe results to the batcher.
		// The batcher will flush to the work queue, which will push
		//	the batches to ES synchronously.
		streamer(spec.file, function(item) {
			var transformed = transform(item);
			if (filter(transformed)) {
				batcher.add(transformed);
			}
		}).then(function() {
			console.log('Finished parsing CSV file');
			console.log('ES is probably still processing...');
			batcher.flush();
		}).catch(function(err) {
			ret.reject(err);
		});
		
		return ret.promise;

	};
}