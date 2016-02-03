var gulp = require('gulp-help')(require('gulp'));
var rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rimraf = require('rimraf');

var paths = {
    outFilename: 'powerbi.js',
    outMinFilename: 'powerbi.min.js',
    jsSource: './src/**/*.js',
    jsDest: './dist/'
};

gulp.task('watch', 'Watches for changes', ['lint'], function () {
    gulp.watch(paths.jsSource, ['lint']);
});

gulp.task('lint', 'Lints all files', ['lint:js']);
gulp.task('build:debug', 'Runs a debug build', ['clean', 'lint:js', 'concat:js']);
gulp.task('build:release', 'Runs a release build', ['clean', 'lint:js', 'concat:js', 'min:js']);

gulp.task('clean', function (callback) {
    rimraf(paths.jsDest, callback);
});

gulp.task('lint:js', 'Lints all JavaScript', function () {
    return gulp.src(paths.jsSource)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('concat:js', 'Combines JavaScript files into a single file', function () {
    return gulp.src(paths.jsSource)
        .pipe(concat(paths.outFilename))
        .pipe(gulp.dest(paths.jsDest));
});

gulp.task('min:js', 'Createds minified JavaScript file', ['concat:js'], function () {
    return gulp.src(paths.jsDest + paths.outFilename)
        .pipe(uglify())
        .pipe(rename(paths.outMinFilename))
        .pipe(gulp.dest(paths.jsDest));
});