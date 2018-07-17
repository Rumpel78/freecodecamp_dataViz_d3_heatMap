/*eslint-disable */
var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

var rollup = require('rollup');
var babel = require('rollup-plugin-babel');

var browserSync = require('browser-sync');

var compressJs = require('gulp-uglify');
var compressCss = require('gulp-cssnano');
var rimraf = require('gulp-rimraf');

var concat = require('gulp-concat');
var replace = require('gulp-replace');
var reload = browserSync.reload;

// Browser
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./build/"
    },
    files: ['./build/**/*.*'],
    browser: 'google chrome',
    port: 5000,
  });
});

// Watch
gulp.task('watch', function() {
  gulp.watch('./js/**/*.js', ['build:js:main']);
  gulp.watch('./css/**/*.css', ['build:css']);
  gulp.watch('./*.html', ['build:html:dev']);
  gulp.watch('./datasets/*', ['move:datasets']);
  gulp.watch('./fonts/*', ['move:fonts']);
});

// Javascript VENDOR
gulp.task('build:js:main', function() {
 return rollup.rollup({
   entry: './js/index.js',
   plugins: [
		 babel({ runtimeHelpers: true })
	 ]
 }).then( function ( bundle ) {
   bundle.write({
     format: 'iife',
     sourceMap: true,
     dest: './build/js/main.js'
   });
   browserSync.reload();
 });
});

// Javascript VENDOR
gulp.task('build:js:vendor', () => {
  return gulp.src('./node_modules/d3/d3.min.js')
    .pipe(concat('vendor.js'))
    .pipe(compressJs())
    .pipe(gulp.dest('build/js'));
});

// COMPRESSION
gulp.task('compress:js', ['clean:map'], function() {
  return gulp.src('build/js/*.js')
    .pipe(compressJs())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('compress:css', function() {
  return gulp.src('build/css/*.css')
    .pipe(compressCss())
    .pipe(gulp.dest('./build/css'));
});

// HTML
var envReplace = function (env) {
  return gulp.src(['index.html'])
    .pipe(replace('__REPLACE_ENV__', env))
    .pipe(gulp.dest('./build'));
}

gulp.task('build:html:dev', function() {
  return envReplace('development');
});

gulp.task('build:html:dist', function() {
  return envReplace('production');
});

// CSS
gulp.task('build:css', function() {
  return gulp.src('./css/*.css')
  .pipe(gulp.dest('build/css'))
  .pipe(reload({stream:true}));
});

// Datasets
gulp.task('move:datasets', function() {
  return gulp.src('./datasets/*')
  .pipe(gulp.dest('build/datasets'))
  .pipe(reload({stream:true}));
});

// Fonts
gulp.task('move:fonts', function() {
  return gulp.src('./fonts/*')
  .pipe(gulp.dest('./build/fonts'))
  .pipe(reload({stream:true}));
});

// Assets
gulp.task('move:assets', function() {
  return gulp.src('./assets/*')
  .pipe(gulp.dest('./build/assets'))
  .pipe(reload({stream:true}));
});

// Clean
gulp.task('clean', function() {
   return gulp.src('./build/*', { read: false })
		.pipe(rimraf({ force: true }));
});

gulp.task('clean:map', function () {
  return gulp.src('./build/js/*.js.map', { read: false })
    .pipe(rimraf({ force: true }));
});

gulp.task('move', ['move:datasets', 'move:fonts', 'move:assets']);
gulp.task('build:assets', ['build:js:main', 'build:js:vendor', 'build:css', 'move']);
gulp.task('compress', ['compress:js', 'compress:css']);

gulp.task('default', gulpSequence('clean', ['build:html:dev', 'build:assets'], 'browser-sync', 'watch'));
gulp.task('dist', gulpSequence('clean', ['build:html:dist', 'build:assets']));

