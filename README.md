# prism
NodeJs tool for loading CSV or JSON files into Elasticsearch

## Preparation
 1. Make sure an Elasticsearch (ES) server is running!
 2. Edit config.js to make sure everything in there looks correct.
 3. If you have multiple files, create a different config/spec file for each!
 - Remember that config.js and spec.js are just ordinary NodeJs modules. You can require external modules, and write any JS code you need, and the module just has to export the correct object. Just don't do anything too crazy.

## Do some real work!

### Indexing a CSV/JSON File
 1. Simply call `run index` to create the ES index and start reading/indexing the CSV file given in `./config.js`
   - `./config.js` is the default config file. If your config is declared in a different file, add that to the end of the call. IE: `run index ./otherConfig.js`
 2. That should do it! If your file is large, it may take several minutes (or more) to complete!
 - Remember that if you index the same file multiple times without clearing the index (below), you'll get duplicate data!

### Clearing an Index
 1. If you want to get rid of an index (this what the file was converted into), then call `run clear`.
   - Just like when indexing, you can specify other config files. IE: `run clear ./otherConfig.js`

### Clearing and Re-Indexing
 - If experimenting with a file, it may be nice to clear and re-index in one step.
 - Use the `-c` or `--clear` argument when calling index to do just this. IE: `run index -c` or `run index --clear`

### Help!
 - Adding `--help` as an argument to any of the above calls will spit out some help. IE: `run --help` or `run index --help`

### Running Prism from another script
 - Prism will look for config files relative to `index.js`. If you are calling Prism from another directory, this will likely lead to issues unless you always specify an absolute path to all files. To fix this, you may set the `PRISM_HOME` environment variable to another location, and Prism will look for all files relative to that.
