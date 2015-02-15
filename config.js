
// This file is meant to be modified by end users.
// You shouldn't need to edit anything else, except maybe package.json, if your spec file requires other libraries.

module.exports = {

	// File to parse. Relative to index.js or an asolute path.
	// If CSV, this should include headers at the top, though if not, I think it will pass
	//	an array each data into the transform function. That's not tested.
	// If JSON, then it should be a line-delimited json file.
	// 	(See https://en.wikipedia.org/wiki/Line_Delimited_JSON)
	fileToParse: './data/test.json',
	//fileToParse: './data/test.csv',

	// The spec file describes the data in the file to parse. 
	// See the sample spec file for details.
	// This path should be relative to index.js, or an absolute path that starts with /
	specFile: './specs/testSpec.js',

	// esConfig is the Elasticsearch client configuration.
	// It matches exactly what you see here:
	// http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/configuration.html
	// Some default values are provided for guidance.
	esConfig: {
		host: 'localhost:9200',
		requestTimeout: 36000000, // Something long, doesn't matter too much, as we're not querying...
		log: 'info'
	}
}