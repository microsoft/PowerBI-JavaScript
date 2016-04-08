var gulp = require('gulp-help')(require('gulp'));
var rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    sourcemaps = require('gulp-sourcemaps'),
    tslint = require("gulp-tslint"),
    ts = require('gulp-typescript'),
    rimraf = require('rimraf'),
    merge = require('merge2'),
    karma = require('karma'),
    paths = require('./paths'),
    webpack = require('webpack-stream'),
    webpackConfig = require('./webpack.config')
    ;

gulp.task('watch', 'Watches for changes', ['lint'], function () {
    gulp.watch(paths.jsSource, ['lint:ts']);
    gulp.watch(paths.specSource, ['lint:spec', 'test']);
});

gulp.task('lint', 'Lints all files', ['lint:ts', 'lint:spec']);
gulp.task('test', 'Runs all tests', ['test:js', 'copy']);
gulp.task('build', 'Runs a full build', ['build:release']);

gulp.task('build:debug', 'Runs a debug build', ['lint', 'compile:ts', 'copy']);
gulp.task('build:release', 'Runs a release build', ['lint', 'compile:ts', 'copy', 'min:js']);

gulp.task('clean', 'Cleans destination folder', function(done) {
    rimraf(paths.jsDest, done);
});

gulp.task('copy', 'Copy .d.ts from src to dest', function() {
    return gulp.src('./src/**/*.d.ts')
        .pipe(gulp.dest('dist/'));
});

gulp.task('lint:ts', 'Lints all TypeScript', function() {
    return gulp.src(['./src/**/*.ts'])
        .pipe(tslint())
        .pipe(tslint.report("verbose"));
});

gulp.task('lint:spec', 'Lints all specs', function() {
    return gulp.src(paths.specSource)
        .pipe(jshint({
            predef: ['$', 'expect', 'beforeAll', 'afterAll', 'powerbi']
        }))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('min:js', 'Creates minified JavaScript file', function() {
    return gulp.src(paths.jsDest + paths.outFilename)
        .pipe(sourcemaps.init({ debug: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.jsDest));
});

gulp.task('test:js', 'Runs unit tests', ['compile:ts'], function(done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: process.env.DEBUG ? false : true
    }, done).start();
});

gulp.task('compile:ts', 'Compile typescript for powerbi library', ['clean'], function() {
    var webpackBundle = gulp.src(['./src/powerbi.ts'])
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('dist/'));

    // TODO: No easy way to generate single declaration (.d.ts) files from multiple es6 modules
    // Current process is to produce individual .d.ts files with tsc -d and then manually concatenate
    // and remove invalid import statements 
    // See: https://github.com/Microsoft/TypeScript/issues/2568

    // var tsResult = gulp.src(['./src/**/*.ts'])
    //     .pipe(ts({
    //         declaration: true
    //     }));

    // return merge([
    //     webpackBundle,
    //     tsResult.dts.pipe(gulp.dest('dist/'))
    // ]);
    
    return webpackBundle;
});