
// This file is meant to be modified by end users.
// You shouldn't need to edit anything else, except maybe package.json, if your spec file requires other libraries.

// Big.js is provided for parsing arbitrary-precision numbers (such as currencies). 
// It's not necessary to use this, but it might be nic eto have.
// See https://www.npmjs.com/package/big.js
// If other libraries are necessary, you'll have to manually edit package.json and add them.
var big = require('big.js');

module.exports = {

	// File to parse. Relative to index.js or an asolute path.
	// If CSV, this should include headers at the top, though if not, I think it will pass
	//	an array each data into the transform function. That's not tested.
	// If JSON, then it should be a line-delimited json file.
	// 	(See https://en.wikipedia.org/wiki/Line_Delimited_JSON)
	fileToParse: './data/test.json',
	//fileToParse: './data/test.csv',

	// esConfig is the Elasticsearch client configuration.
	// It matches exactly what you see here:
	// http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/configuration.html
	// Some default values are provided for guidance.
	esClientConfig: {
		host: 'localhost:9200',
		requestTimeout: 36000000, // Something long, doesn't matter too much, as we're not querying...
		log: 'info'
	},

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