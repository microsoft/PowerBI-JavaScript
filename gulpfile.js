var gulp = require('gulp');
var ghPages = require('gulp-gh-pages'),
  header = require('gulp-header'),
  help = require('gulp-help-four'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  replace = require('gulp-replace'),
  tslint = require("gulp-tslint"),
  ts = require('gulp-typescript'),
  flatten = require('gulp-flatten'),
  fs = require('fs'),
  del = require('del'),
  moment = require('moment'),
  karma = require('karma'),
  typedoc = require('gulp-typedoc'),
  webpack = require('webpack'),
  webpackStream = require('webpack-stream'),
  webpackConfig = require('./webpack.config'),
  webpackTestConfig = require('./webpack.test.config'),
  runSequence = require('gulp4-run-sequence'),
  argv = require('yargs').argv;
;

help(gulp, undefined);

var package = require('./package.json');
var webpackBanner = package.name + " v" + package.version + " | (c) 2016 Microsoft Corporation " + package.license;
var gulpBanner = "/*! " + webpackBanner + " */\n";

gulp.task('ghpages', 'Deploy documentation to gh-pages', ['nojekyll'], function () {
  return gulp.src(['./docs/**/*'], {
    dot: true
  })
    .pipe(ghPages({
      force: true,
      message: 'Update ' + moment().format('LLL')
    }));
});

gulp.task("docs", 'Compile documentation from src code', function () {
  return gulp
    .src([
      "typings/globals/es6-promise/index.d.ts",
      "node_modules/powerbi-models/dist/models.d.ts",
      "src/**/*.ts"
    ])
    .pipe(typedoc({
      mode: 'modules',
      includeDeclarations: true,

      // Output options (see typedoc docs) 
      out: "./docs",
      json: "./docs/json/" + package.name + ".json",

      // TypeDoc options (see typedoc docs) 
      ignoreCompilerErrors: true,
      version: true
    }))
    ;
});

gulp.task('copydemotodocs', 'Copy the demo to the docs', function () {
  return gulp.src(["demo/**/*"])
    .pipe(gulp.dest("docs/demo"))
    ;
});

gulp.task('nojekyll', 'Add .nojekyll file to docs directory', function (done) {
  fs.writeFile('./docs/.nojekyll', '', function (error) {
    if (error) {
      throw error;
    }

    done();
  });
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
    'lint:ts',
    'config',
    'compile:spec',
    'test:js',
    done
  );
});

gulp.task('build', 'Runs a full build', function (done) {
  runSequence(
    'lint:ts',
    'clean',
    'config',
    ['compile:ts', 'compile:dts'],
    'min:js',
    'header',
    done
  );
});

gulp.task('build:docs', 'Build docs folder', function (done) {
  return runSequence(
    'clean:docs',
    'docs',
    'nojekyll',
    'copydemotodocs',
    done
  );
});

gulp.task('config', 'Update config version with package version', function () {
  return gulp.src(['./src/config.ts'], { base: "./" })
    .pipe(replace(/version: '([^']+)'/, `version: '${package.version}'`))
    .pipe(gulp.dest('.'));
});

gulp.task('header', 'Add header to distributed files', function () {
  return gulp.src(['./dist/*.d.ts'])
    .pipe(header(gulpBanner))
    .pipe(gulp.dest('./dist'));
});

gulp.task('clean', 'Cleans destination folder', function (done) {
  return del([
    './dist/**/*'
  ]);
});

gulp.task('clean:docs', 'Clean docs directory', function () {
  return del([
    'docs/**/*',
    'docs'
  ]);
});

gulp.task('lint:ts', 'Lints all TypeScript', function () {
  return gulp.src(['./src/**/*.ts', './test/**/*.ts'])
    .pipe(tslint({
      formatter: "verbose"
    }))
    .pipe(tslint.report());
});

gulp.task('min:js', 'Creates minified JavaScript file', function () {
  return gulp.src(['!./dist/*.min.js', './dist/*.js'])
    .pipe(uglify({
      preserveComments: 'license'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('compile:ts', 'Compile typescript for powerbi-client library', function () {
  webpackConfig.plugins = [
    new webpack.BannerPlugin(webpackBanner)
  ];

  return gulp.src(['./src/powerbi-client.ts'])
    .pipe(webpackStream(webpackConfig))
    .pipe(gulp.dest('dist/'));
});

gulp.task('compile:dts', 'Generate one dts file from modules', function () {
  var tsProject = ts.createProject('tsconfig.json', {
    declaration: true,
    sourceMap: false
  });

  var settings = {
    out: "powerbi-client.js",
    declaration: true
  };

  var tsResult = tsProject.src()
    .pipe(ts(settings));

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
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: argv.watch ? false : true,
    captureTimeout: argv.timeout || 60000
  }, done).start();
});