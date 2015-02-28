

// Work queue that throttles the processing of work items.
// The maximum number of work items that may be worked concurrently is given by the 'concurrent' option.
//	The default is 1, meaning that work items are procssed one at a time.
// The 'callback' option is a function that is expected to return a Q-like promise, so that the work queue
//	knows when the function is finished, and it can start executing the next time.
// If the callbak does not return a Q-like promise, then it is assumed to be complete
//	as soon as the callback returns.
// There is some optimization done, in that the watcher is turned off if the queue is empty.

module.exports = {
	init: init
}

function init(eggnog) {

	eggnog.exports = function(opts) {

		opts = opts || {};

		var callback = opts.callback;
		var concurrency = opts.concurrency || 1; 
		var interval = opts.interval || 50; // How often to check, defaults to 50ms

		if (!callback) {
			throw 'Must provide \'callback\' parameter to constructor of work queue';
		}

		// The work queue!
		var queue = [];

		// Number of items currently being processed
		var processing = 0;

		// Timer that polls the queue
		var timer = undefined;

		return {
			push: push,
			empty: empty,
			notEmpty: notEmpty
		};

		function push() {
			var item = Array.prototype.slice.call(arguments);
			queue.push(item);
			startTimer();
		}

		function notEmpty() {
			return queue.length > 0;
		}

		function empty() {
			return queue.length === 0;
		}

		function onStep() {
			if (workAvailable()) {
				var item = queue.shift();
				processing += 1;

				var res = callback.apply(undefined, item);
				if (res && res.fin) {
					res.fin(onComplete);
				} else {
					onComplete();
				}
			}
		}

		function workAvailable() {
			return processing < concurrency && queue.length > 0;
		}

		function onComplete() {
			processing -= 1;
			if (queue.length == 0) {
				clearTimer();
			}
		}

		function startTimer() {
			if (!timer) {
				timer = setInterval(onStep, interval);
			}
		}

		function clearTimer() {
			clearInterval(timer);
			timer = undefined;
		}

	};
}