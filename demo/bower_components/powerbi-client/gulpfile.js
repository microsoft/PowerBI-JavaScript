var gulp = require('gulp-help')(require('gulp'));
var ghPages = require('gulp-gh-pages'),
    header = require('gulp-header'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    replace = require('gulp-replace'),
    sourcemaps = require('gulp-sourcemaps'),
    tslint = require("gulp-tslint"),
    ts = require('gulp-typescript'),
    flatten = require('gulp-flatten'),
    rimraf = require('rimraf'),
    merge = require('merge2'),
    karma = require('karma'),
    webpack = require('webpack');
    webpackStream = require('webpack-stream'),
    webpackConfig = require('./webpack.config'),
    webpackTestConfig = require('./webpack.test.config'),
    runSequence = require('run-sequence'),
    argv = require('yargs').argv;
    ;

var package = require('./package.json');
var webpackBanner = package.name + " v" + package.version + " | (c) 2016 Microsoft Corporation " + package.license;
var gulpBanner = "/*! " + webpackBanner + " */\n";

gulp.task('ghpages', function() {
  return gulp.src(['./demo/**/*'])
    .pipe(ghPages({
        force: true
    }));
});

gulp.task('watch', 'Watches for changes', ['lint'], function () {
    gulp.watch(['./src/**/*.ts', './test/**/*.ts'], ['lint:ts']);
    gulp.watch(['./test/**/*.ts'], ['test']);
});

gulp.task('lint', 'Lints all files', function (done) {
    runSequence(
        'lint:ts',
        done
    );
});

gulp.task('test', 'Runs all tests', function (done) {
    runSequence(
        'config',
        'compile:spec',
        'test:js',
        done
    );
});

gulp.task('build', 'Runs a full build', function (done) {
    runSequence(
        'lint',
        'clean',
        'config',
        ['compile:ts', 'compile:dts'],
        'min:js',
        'header',
        done
    );
});

gulp.task('config', 'Update config version with package version', function () {
    return gulp.src(['./src/config.ts'], {base: "./"})
        .pipe(replace(/version: '([^']+)'/, `version: '${package.version}'`))
        .pipe(gulp.dest('.'));
});

gulp.task('header', 'Add header to distributed files', function () {
    return gulp.src(['./dist/*.d.ts'])
        .pipe(header(gulpBanner))
        .pipe(gulp.dest('./dist'));
});

gulp.task('clean', 'Cleans destination folder', function(done) {
    rimraf('./dist/', done);
});

gulp.task('lint:ts', 'Lints all TypeScript', function() {
    return gulp.src(['./src/**/*.ts', './test/**/*.ts'])
        .pipe(tslint())
        .pipe(tslint.report("verbose"));
});

gulp.task('min:js', 'Creates minified JavaScript file', function() {
    return gulp.src(['!./dist/*.min.js', './dist/*.js'])
        .pipe(uglify({
            preserveComments: 'license'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('compile:ts', 'Compile typescript for powerbi library', function() {
    webpackConfig.plugins = [
        new webpack.BannerPlugin(webpackBanner)
    ];

    return gulp.src(['./src/powerbi.ts'])
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest('dist/'));
});

gulp.task('compile:dts', 'Generate dts files from modules', function () {
    var tsProject = ts.createProject('tsconfig.json', {
        declaration: true,
        sourceMap: false
    });

    var tsResult = tsProject.src()
        .pipe(ts(tsProject));
    
    return tsResult.dts
        .pipe(flatten())
        .pipe(gulp.dest('./dist'));
});


gulp.task('compile:spec', 'Compile spec tests', function () {
    return gulp.src(['./test/test.spec.ts'])
        .pipe(webpackStream(webpackTestConfig))
        .pipe(gulp.dest('./tmp'));
});

gulp.task('test:js', 'Run js tests', function (done) {
    new karma.Server.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: argv.debug ? false : true,
        captureTimeout: argv.timeout || 60000
    }, done);
});