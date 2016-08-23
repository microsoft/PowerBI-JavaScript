var argv = require('yargs').argv;

var browserName = 'PhantomJS';
if (argv.chrome) {
  browserName = 'Chrome'
}
else if (argv.firefox) {
  browserName = 'Firefox'
}

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      './node_modules/jquery/dist/jquery.js',
      './node_modules/es6-promise/dist/es6-promise.js',
      './tmp/**/*.js',
      { pattern: './test/**/*.html', served: true, included: false }
    ],
    exclude: [],
    reporters: argv.debug ? ['spec'] : ['spec', 'coverage'],
    autoWatch: true,
    browsers: [browserName],
    plugins: [
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-spec-reporter',
      'karma-phantomjs-launcher',
      'karma-coverage'
    ],
    preprocessors: { './tmp/**/*.js': ['coverage'] },
    coverageReporter: {
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    logLevel: argv.debug ? config.LOG_DEBUG : config.LOG_INFO,
    client: {
      args: argv.logMessages ? ['logMessages'] : []
    }
  });
};