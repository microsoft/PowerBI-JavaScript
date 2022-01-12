var argv = require('yargs').argv;

var browserName = 'PhantomJS';
if (argv.chrome) {
  browserName = 'Chrome_headless'
}
else if (argv.firefox) {
  browserName = 'Firefox'
}
const flags = [
  '--disable-extensions',
  '--no-proxy-server',
  '--js-flags="--max_old_space_size=6500"',
  '--high-dpi-support=1',
];
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
    reporters: argv.chrome ? ['kjhtml'] : ['spec', 'junit'],
    autoWatch: true,
    browsers: [browserName],
    browserNoActivityTimeout: 300000,
    plugins: [
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-spec-reporter',
      'karma-phantomjs-launcher',
      'karma-jasmine-html-reporter',
      'karma-junit-reporter'
    ],
    customLaunchers: {
      'Chrome_headless': {
        base: 'Chrome',
        flags: flags.concat("--no-sandbox", "--window-size=800,800"),
      },
    },
    junitReporter: {
      outputDir: 'tmp',
      outputFile: 'testresults.xml',
      useBrowserName: false
    },
    retryLimit: 0,
    logLevel: argv.debug ? config.LOG_DEBUG : config.LOG_INFO,
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    }
  });
};