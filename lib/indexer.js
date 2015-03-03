
module.exports = {
	imports: [
		'es.client',
		'utils.batcher'
	],
	extImports: [
		'q',
		'progress',
		'work-queue'
	],
	init: init
};

// Number of concurrent batches to send to ES
var maxConcurrency = 2;

function init(eggnog) {

	var q = eggnog.import('q');
	var EsClient = eggnog.import('es.client');
	var ProgressBar = eggnog.import('progress');

	var Batcher = eggnog.import('utils.batcher');
	var WorkQueue = eggnog.import('work-queue');

	eggnog.exports = function(spec, esClientConfig) {

		var ret = q.defer();
		var client = new EsClient(spec, esClientConfig);

		var streamer = spec.streamer;
		var batchSize = spec.batchSize;
		var transform = spec.transform || function(x) { return x; };
		var filter = spec.filter || function() { return true; };

		// The number of rows that needs to be indexed.
		// Will be updated as we parse the file.
		var totalRows = 0;

		// Number of currently-processing batches.
		var numProcessing = 0;

		// Whether we've finished parsing the file
		var finishedParsing = false;

		// Number of rows we've parsed and indexed
		var totalProcessed = 0;

		var queue = new WorkQueue({
			concurrency: maxConcurrency,
			callback: function(items, batchId) {

				var finish = function() {
					// Try to do a lot of stuff to make sure the progressbar is updated.
					// Threading issues are annoying...
					progressbar.total = totalProcessed;
					progressbar.curr = totalProcessed;
					progressbar.render();
					console.log('\n');
					clearTimeout(updateProgressBarTimer);
					updateProgressBarTimer = undefined;
					ret.resolve();
				};

				return client.indexItems(items)
					.then(function() {
						progressbar.tick(items.length);
						totalProcessed += items.length;
						// success
						numProcessing -= 1;
						if (numProcessing == 0 && finishedParsing) {
							finish();
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

		var progressbar = new ProgressBar('Processing [:bar] :current of :total (:percent :etas)', {
			complete: '=',
			incomplete: ' ',
			width: 50,
			total: 1 // This is temporary. We update this as we parse rows
		});

		var updateProgressBarTotal = function() {
			progressbar.total = totalRows;
			progressbar.render();
		};

		var startParsing = function() {
			// While we're parsing, update the progress bar total occasionally to
			//	reflect the latest total
			updateProgressBarTimerTotal = setInterval(updateProgressBarTotal, 1000);

			return streamer(spec.file, function(item) {
				var transformed = transform(item);
				if (filter(transformed)) {
					totalRows += 1;
					batcher.add(transformed);
				}
			});
		};

		var finishedParsing = function() {
			finishedParsing = true;
			batcher.flush();
		};

		// Start file scanning, which will pipe results to the batcher.
		// The batcher will flush to the work queue, which will push
		//	the batches to ES synchronously.
		// Make sure the index has been created first
		client.createIndex()
			.then(startParsing)
			.then(finishedParsing)
			.catch(function(err) {
				ret.reject(err);
			});
		
		
		return ret.promise;

	};
}