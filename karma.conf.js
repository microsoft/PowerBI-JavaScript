var paths = require('./paths');
var argv = require('yargs').argv;

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: paths.karmaFiles,
        exclude: [],
        reporters: argv.debug ? ['spec'] : ['spec', 'coverage'],
        autoWatch: true,
        browsers: [argv.debug ? 'Chrome' : 'PhantomJS'],
        plugins: [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-spec-reporter',
            'karma-phantomjs-launcher',
            'karma-coverage'
        ],
        preprocessors: { './src/**/*.js': ['coverage'] },
        coverageReporter: {
            reporters: [
                { type: 'html' },
                { type: 'text-summary' }
            ]
        },
        logLevel: argv.debug ? config.LOG_DEBUG : config.LOG_INFO
    });
};