
var eggnog = require('eggnog');

var ctx = eggnog.newContext({
	nodeModulesAt: __dirname
});

ctx.addDirectory(__dirname + '/lib');

var cli = ctx.main();

// The root directory is either the PRISM_HOME environment variable, or 
//	default to __dirname if not provided.
var prismHome = process.env.PRISM_HOME;
if (!prismHome) {
	console.log('WARNING: No PRISM_HOME environment variable detected. Using the default of ', __dirname);
	prismHome = __dirname;
}

cli(prismHome);
