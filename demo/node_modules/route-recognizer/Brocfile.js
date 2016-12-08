var compileModules = require('broccoli-compile-modules');
var jsHint = require('broccoli-jshint');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var concat = require('broccoli-concat');
var replace = require('broccoli-string-replace');

/**
 * Builds the consumable lib
 * @param  {Tree} libTree
 * @return {Array}
 */
function buildDistLib (libTree) {
  var compiledModules = compileModules( libTree, {
    inputFiles: ['route-recognizer.umd.js'],
    output: '/route-recognizer.js'
  });

  var es6Modules = new Funnel( libTree, {
    exclude: ['*.umd.js'],
    destDir: '/es6'
  });

  return mergeTrees([es6Modules, compiledModules]);
}

/**
 * Builds the test suite including jsHint
 * and Qunit harness.
 * @param  {Tree} libTree
 * @return {Tree}
 */
function buildTestSuite (libTree) {
  var destination = '/tests';

  var jsHintLib = jsHint(libTree);

  var testTree = new Funnel( 'tests', {
    files: ['recognizer-tests.js', 'router-tests.js'],
    destDir: destination
  });

  var jsHintTests = jsHint(testTree);

  var allTestFiles = mergeTrees([libTree, testTree]);

  var testBundle = compileModules(allTestFiles, {
    inputFiles: ['route-recognizer.js', 'tests/*.js'],
    formatter: 'bundle',
    output: '/tests/route-recognizer-test-bundle.js'
  });

  var tests = mergeTrees([jsHintLib, jsHintTests, testBundle]);

  tests = concat(tests, {
    inputFiles: ['**/*.js'],
    outputFile: '/tests/route-recognizer-test-bundle.js'
  });

  var testHarness = new Funnel( 'tests', {
    files: ['index.html'],
    destDir: destination
  });

  var qunit = new Funnel('bower_components/qunit/qunit', {
    files: ['qunit.js', 'qunit.css'],
    destDir: destination
  });

  return mergeTrees([tests, testHarness, qunit]);
}

var lib = new Funnel( 'lib', {
  destDir: '/'
});

var version = require('./package.json').version;

lib = replace(lib, {
  files: [ '**/*.js' ],
  patterns: [
    { match: /VERSION_STRING_PLACEHOLDER/g, replacement: version }
  ]
});

var testSuite = buildTestSuite(lib);
var distLibs  = buildDistLib(lib);

module.exports = mergeTrees([distLibs, testSuite]);
