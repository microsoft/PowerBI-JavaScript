var gulp = require('gulp-help')(require('gulp'));
var rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rimraf = require('rimraf'),
    karma = require('karma'),
    paths = require('./paths');

gulp.task('watch', 'Watches for changes', ['lint'], function () {
    gulp.watch(paths.jsSource, ['lint:js']);
    gulp.watch(paths.specSource, ['lint:spec', 'test']);
});

gulp.task('lint', 'Lints all files', ['lint:js', 'lint:spec']);
gulp.task('test', 'Runs all tests', ['test:js']);
gulp.task('build:debug', 'Runs a debug build', ['clean', 'lint', 'concat:js']);
gulp.task('build:release', 'Runs a release build', ['clean', 'lint', 'concat:js', 'min:js']);

gulp.task('clean', 'Cleans destination folder', function (done) {
    rimraf(paths.jsDest, done);
});

gulp.task('lint:js', 'Lints all JavaScript', function () {
    return gulp.src(paths.jsSource)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint:spec', 'Lints all specs', function () {
    return gulp.src(paths.specSource)
        .pipe(jshint({
            predef: ['$', 'expect', 'beforeAll', 'afterAll']
        }))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('concat:js', 'Creates combined JavaScript file', function () {
    return gulp.src(paths.jsSource)
        .pipe(concat(paths.outFilename))
        .pipe(gulp.dest(paths.jsDest));
});

gulp.task('min:js', 'Creates minified JavaScript file', ['concat:js'], function () {
    return gulp.src(paths.jsDest + paths.outFilename)
        .pipe(uglify())
        .pipe(rename(paths.outMinFilename))
        .pipe(gulp.dest(paths.jsDest));
});

gulp.task('test:js', 'Runs unit tests', function (done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: process.env.DEBUG ? false : true
    }, done).start();
});