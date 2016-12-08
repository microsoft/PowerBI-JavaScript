var glob = require('glob');
var path = require('path');
var bench = require('do-you-even-bench');

bench(glob.sync( './bench/benches/*.js' ).map( function( file ) {
  return require( path.resolve( file ) );
}));