
var elasticsearch = require('elasticsearch');

module.exports = function(spec, esOpts) {
	
	var client = new elasticsearch.Client(esOpts);
		
	var self = {
		createIndex: createIndex,
		deleteIndex: deleteIndex,
		send: send
	};
	
	return self;
	
	/////
	
	function createIndex() {
		var mappings = undefined;
		if (spec.mapping) {
			mappings = {};
			mappings[spec.esType] = spec.mapping;
		}
		var body = {
			mappings: mappings
		};
		
		return client.indices.create({
	    index: spec.esIndex,
			body: body
		})
		.catch(function(err) {
	    // We only care if the error is something other than the index already existing
	    if (normalizeErrorMessage(err.message).indexOf('indexalreadyexistsexception') === -1) {
	      throw err;
	    }
	  });
	}
	
	function deleteIndex() {
		return client.indices.delete({
	    index: spec.esIndex
	  })
	  .catch(function(err) {
	    if (normalizeErrorMessage(err.message).indexOf('indexmissingexception') === -1) {
	      throw err;
	    }
	  });
	}
	
	function send(items) {
		if (!items.constructor || items.constructor !== Array) {
			items = [items];
		}
		
		var body = [];
		items.forEach(function(item) {
			body.push({ index:  { _index: spec.esIndex, _type: spec.esType } });
			body.push(item);
		});
				
		return client.bulk({
	    body: body
	  });
	}
	
};

function normalizeErrorMessage(msg) {
	return msg.toLowerCase().replace(/_/g, '');
}
