'use strict';

const Promise = require('bluebird');
const gulp = require('gulp');

const _ = require('lodash');
const $ = require('gulp-load-plugins')();
const fs = Promise.promisifyAll(require('fs-extra'));
const opn = require('opn')
const runSequence = require('run-sequence');

const widgetConfig = require('./build/config/widget.config.json');

if (!_.has(gulp,'context')) {
  gulp.context = {
    widgetName: widgetConfig.widgetName
  };
}
else {
  console.error('Unexpected build failure. gulp already has a context.');
  process.exit(1);
}

fs.readdirSync('./build/tasks').filter(function(file) {
  return (/\.js$/i).test(file);
}).map(function(file) {
  require(`./build/tasks/${file}`);
});

gulp.task('default', function () {
  gulp.start('build');
});

// gulp.task('build', function(done) {
//   //runSequence('clean', 'core', ['makeDocs', 'makeExample'], done);
//   runSequence('clean', 'core', 'testSpecs', ['makeDocs', 'makeExample'], done);
// });

// gulp.task('build_s', function(done) {
//   runSequence('clean', 'core', ['makeDocs', 'makeExample'], done);
// });

// gulp.task('core', ['compileES6ToInst', 'less', 'copy', 'buildContentManifest']);

// gulp.task('core', ['compileES6ToInst', 'less', 'copy', 'buildContentManifest']);

gulp.task('build', function(done) {
  runSequence('clean', 'copy', 'buildContentManifest', ['makeDocs'], done);
});

// Live reload is disabled by default as the author of this package saves changes frequently,
// and therefore prefers manual reload. 
gulp.task('serve', ['build', 'connect'], function () {
  opn('http://localhost:9000');
});

// gulp.task('serve', ['core', 'compileInternalWeb', 'connect', 'watch'], function () {
//   opn('http://localhost:9000');
// });
