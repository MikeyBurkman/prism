
var program = require('commander');
var exit = require('exit');
var path = require('path');
var indexErase = require('./indexErase');
var indexer = require('./indexer');
var specLoader = require('./spec/loader');

module.exports = run;

////////////////////

var rootDir = './';
var configPath = undefined;

var spec = undefined;
var esClientConfig = undefined;

function run(root) {
  rootDir = root;

  var commandExecuted = runCli(program);
  if (!commandExecuted) {
    program.outputHelp();
  }
}

function loadConfig(configPath) {
  if (spec) {
    return; // Already loaded the config
  }
  
  configPath = configPath || './config.js';
  var absCfgPath = path.resolve(rootDir, configPath);
  console.log('Using config.js: ', absCfgPath);

  var cfg = require(absCfgPath);
  esClientConfig = cfg.esClientConfig;
  
  spec = specLoader(cfg);
}

var startTime = new Date();
function complete(status) {
  status = status || 0;
  var endTime = new Date();
  var diffMs = endTime.getTime() - startTime.getTime();
  var diffS = diffMs/1000.0;
  console.log('Finished at ', endTime);
  console.log('(Total time: [', diffS, '] seconds)');
  exit(status);
}

function onError(err) {
  console.error('Error!');
  console.error(err.stack);
  complete(1);
}

function runCli(cli) {

  var commandExecuted = undefined;

  cli
    .description('Used to parse CSV or JSON files and insert them into Elasticsearh for querying')
    .option('-c, --config', 'Specifies a config file to use. Defaults defaults to ' + rootDir + '/config.js');

  cli
    .command('index')
      .description('Index the given config file and load the data into Elasticsearch.')
      .option('-e, --erase', 'Erase the index before indexing')
      .action(function(config, options) {
        commandExecuted = 'index';
        loadConfig();
        
        var clear = options && options.clear;
        if (clear) {
          indexErase(spec, esClientConfig)
            .then(function() {
              return indexer(spec, esClientConfig);
            })
            .then(complete)
            .catch(onError);
        } else {
          indexer(spec, esClientConfig)
            .then(complete)
            .catch(onError);
        }
      });

  cli
    .command('erase')
      .description('Erase the index for the given config file from Elasticsearch.')
      .action(function(config) {
        commandExecuted = 'erase';
        loadConfig();
        
        indexErase(spec, esClientConfig)
            .then(complete)
            .catch(onError);
      });

  cli.parse(process.argv);

  return commandExecuted;
}
