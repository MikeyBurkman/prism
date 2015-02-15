
module.exports = {
	imports: [
		'es.client'
	],
	init: init
}

function init(eggnog) {
	var EsClient = eggnog.import('es.client');

	eggnog.exports = function(spec, esClientConfig) {
		var client = new EsClient(spec, esClientConfig);
		console.log('Clearing index: ', spec.esIndex);
		return client.clearIndex();
	};
}
