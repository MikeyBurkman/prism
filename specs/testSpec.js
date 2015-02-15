
// Big.js is provided for parsing arbitrary-precision numbers (such as currencies).
// See https://www.npmjs.com/package/big.js
// If other libraries are necessary, you'll have to manually edit package.json and add them.
var big = require('big.js');

module.exports = {

	// Size of each batch sent to Elasticsearch.
	// Defaults to 1000. Probably don't need to change it.
	//batchSize: 1000,

	// The indexname in Elasticsearch. (All lowercase!)
	esIndex: 'testindex',

	// The data type in ES for the data being loaded. All rows will be assigned this type.
	// You could index multiple files, each with their own data type, into the same
	// 	ES instance.
	esType: 'teststuff',

	// This matches the "properties" mapping for Elasticsearch.
	// The fields match those returned by the transform function below (if there was one).
	// See http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping.html
	esMapping: {
		name: { type: 'string', index: 'not_analyzed' },
		color: { type: 'string', index: 'not_analyzed' },
		animal: { type: 'string', index: 'not_analyzed' },
		birthday: { type: 'date', format: 'MM/dd/yyyy'},
		things: { type: 'string' }
	},

	// Optional transformation function.
	// Used when you need to transform the data into another format before sending to ES.
	// Defaults to an identity transformation. (Returns the data in the same format as it
	//	is in the source file.)
	transform: function(data) {

		// Things is either a comma-deliminated string (csv), or a json array.
		// Make sure it's an array when we're done with it.
		var things = data['Things'] || [];
		if (typeof things === 'string') {
			things = things.split(',');
		}

		var x = {
			name: data['Name'],
			color: data['Favorite Color'],
			animal: data['Spirit Animal'],
			birthday: data['Birthday'],
			things: things
		};

		return x;
	},

	// Optional filter function.
	// Used when you need to explicitly filter out known bad data.
	// Defaults to a function that always returns true. (No data is filtered.)
	filter: function(data) {
		return true;
	}
}


