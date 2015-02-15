
module.exports = {
  isMain: true,
  imports: [
    'indexClear',
    'indexer',
    'spec.loader'
  ],
  extImports: [
    'commander',
    'exit',
    'path'
  ],
  init: init
}

function init(eggnog) {

  var program = eggnog.import('commander');
  var exit = eggnog.import('exit');
  var path = eggnog.import('path');
  var indexClear = eggnog.import('indexClear');
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

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
      program.help();
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

    var fileToParse = path.resolve(rootDir, cfg.fileToParse);
    console.log('Parsing file: ', fileToParse);
    
    var specFile = path.resolve(rootDir, cfg.specFile);
    console.log('Using spec file: ', specFile);
    var specModule = require(specFile);
    specModule.file = fileToParse;
    spec = specLoader(specModule);
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
    console.log('error! ', err);
    complete(1);
  }

  program
  .description('Used to parse CSV or JSON files and insert them into Elasticsearh for querying');

  program
    .command('index [config]')
      .description('Index the given spec file and load the data into Elasticsearch')
      .option('-c, --clear', 'Clear the index before indexing')
      .action(function(config, options) {
        loadConfig(config);
        
        var clear = options.clear;
        if (clear) {
          indexClear(spec)
            .then(function() {
              return indexer(spec, esClientConfig);
            })
            .catch(onError)
            .then(complete);
        } else {
          indexer(spec)
            .catch(onError)
            .then(complete);
        }
      });

  program
    .command('clear [config]')
      .description('Clears the index for the given spec file from Elasticsearch')
      .action(function(config) {
        loadConfig(config);
        
        indexClear(spec, esClientConfig)
            .catch(onError)
            .then(complete);
      });

}
