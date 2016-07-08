
var cli = require('./lib/cli');

// The root directory is either the PRISM_HOME environment variable, or
//	default to __dirname if not provided.
var prismHome = process.env.PRISM_HOME;
if (!prismHome) {
	console.log('WARNING: No PRISM_HOME environment variable detected. Using the default of ', __dirname);
	prismHome = __dirname;
}

cli(prismHome);
