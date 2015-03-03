
module.exports = {
  isMain: true,
  imports: [
    'indexErase',
    'indexer',
    'spec.loader'
  ],
  extImports: [
    'commander',
    'exit',
    'path',
    'progress'
  ],
  init: init
};

function init(eggnog) {

  var program = eggnog.import('commander');
  var exit = eggnog.import('exit');
  var path = eggnog.import('path');
  var indexErase = eggnog.import('indexErase');
  var indexer = eggnog.import('indexer');
  var specLoader = eggnog.import('spec.loader');

  eggnog.exports = run;

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
    
    spec = specLoader.load(cfg);
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
          loadConfig(config);
          
          var clear = options.clear;
          if (clear) {
            indexErase(spec, esClientConfig)
              .then(function() {
                return indexer(spec, esClientConfig);
              })
              .catch(onError)
              .then(complete);
          } else {
            indexer(spec, esClientConfig)
              .catch(onError)
              .then(complete);
          }
        });

    cli
      .command('erase')
        .description('Erase the index for the given config file from Elasticsearch.')
        .action(function(config) {
          commandExecuted = 'erase';
          loadConfig(config);
          
          indexErase(spec, esClientConfig)
              .catch(onError)
              .then(complete);
        });

    cli.parse(process.argv);

    return commandExecuted;
  }

}
