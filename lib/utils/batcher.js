
module.exports = {
	init: init
};

function init(eggnog) {

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
			var toSend = batch;
			var toSendId = batchId;
			batch = [];
			batchId += 1;
			callback(toSend, toSendId);
		}

	};
}