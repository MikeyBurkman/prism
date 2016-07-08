
var Promise = require('bluebird');
var EsClient = require('./es/client.js');

module.exports = function(spec, esClientConfig) {
	var client = new EsClient(spec, esClientConfig);
	console.log('Erasing index: ', spec.esIndex);
	return client.deleteIndex();
};
