var paths = require('./paths');

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: paths.karmaFiles,
        exclude: [],
        reporters: process.env.DEBUG ? ['spec'] : ['spec', 'coverage'],
        autoWatch: true,
        browsers: [process.env.DEBUG ? 'Chrome' : 'PhantomJS'],
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
        logLevel: config.LOG_INFO
    });
};