
var eggnog = require('../eggnog');
var config = require('./config.js');
var path = require('path');

var ctx = eggnog.newContext({
	nodeModulesAt: __dirname
});

ctx.addDirectory(__dirname + '/lib');

var cli = ctx.main();

cli(__dirname);
