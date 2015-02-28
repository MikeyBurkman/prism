
module.exports = {
	extImports: [
		'elasticsearch',
		'q'
	],
	init: init
};

function init(eggnog) {
	var es = eggnog.import('elasticsearch');

	// EsClient says it returns promises, but I prefer the Q API
	// Use Q to wrap the regular callbacks in Q promises
	var q = eggnog.import('q');

	eggnog.exports = EsClient;

	function EsClient(spec, config) {

		var esClient = es.Client(config);

		// Throttle everything to singel-threaded because we overwhelm the server otherwise.
		this.clearIndex = clearIndex;
		this.indexExists = indexExists;
		this.createIndex = createIndex;
		this.indexItems = indexItems;

		function staticRet(val) {
			return q.fcall(function() {
				return val;
			});
		}

		function clearIndex() {
			return indexExists()
				.then(function(exists) {
					if (exists) {
						return q.ninvoke(esClient.indices ,'delete', {
							index: spec.esIndex
						});
					}

					// Ignore if it doesn't exist
					return staticRet();
				});
			
		}

		function indexExists() {
			return q.ninvoke(esClient.indices ,'exists', {
				index: spec.esIndex
			}).then(function(res) {
				var exists = res[0];
				return exists;
			});
		}

		function createIndex() {
			return indexExists()
				.then(function(exists) {
					if (exists) {
						// Don't care if it already exists
						return true;
					}
					var mappings = undefined;
					if (spec.mapping) {
						mappings = {};
						mappings[spec.esType] = spec.mapping;
					}
					var body = {
						mappings: mappings
					};
					return q.ninvoke(esClient.indices ,'create', {
						index: spec.esIndex,
						body: body
					});
				});
		}

		function indexItems(items) {
			if (items.length == 0) {
				var d = q.defer();
				d.resolve();
				return d.promise;
			}

			var body = [];
			items.forEach(function(item) {
				body.push({ index:  { _index: spec.esIndex, _type: spec.esType } });
				body.push(item);
			});
			return q.ninvoke(esClient, 'bulk', {
				body: body
			});
		}
	}


}


