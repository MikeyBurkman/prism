
module.exports = {
	extImports: [
		'q'
	],
	init: init
};

function init(eggnog) {
	var q = eggnog.import('q');

	eggnog.exports = function(batchSize, callback) {

		var batch = [];
		var batchId = 1;

		return {
			add: add,
			flush: flush
		};

		function add(item) {
			batch.push(item);
			if (batch.length >= batchSize) {
				flush();
			}
		}

		function flush() {
			var def = q.defer();

			var toSend = batch;
			var toSendId = batchId;
			batch = [];
			batchId += 1;
			if (toSend.length > 0) {
				callback(toSend, toSendId);
			}
		}

	};
}