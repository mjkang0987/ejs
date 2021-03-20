const gulp = require('gulp');
const scss = require('gulp-sass');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const del = require('del');

const PATH = {
  HTML: 'views',
  STYLES: 'styles',
  IMAGES: 'images',
  SCRIPTS: 'scripts',
  JSON: 'data',
  DIST: 'dist'
};

const {HTML, STYLES, IMAGES, SCRIPTS, DIST, _HTML, _STYLES, _IMAGES, _SCRIPTS} = PATH

gulp.task('clean', () => {
  return new Promise(resolve => {
    del.sync(DIST, {force: true});
    resolve();
  });
});

gulp.task('html', () => {
  return new Promise(resolve => {
    gulp.src(`${HTML}/*.ejs`)
      .pipe(rename({ extname: '.html' }))
      .pipe(gulp.dest(`${DIST}${_HTML}`));
    resolve();
  });
});

gulp.task('styles', () => {
  return new Promise(resolve => {
    const options = {
      outputStyle: 'nested',
      indentType: 'space',
      indentWidth: 4,
      precision: 8,
      sourceComments: false
const {HTML, STYLES, IMAGES, SCRIPTS, JSON, DIST} = PATH;
    };
    gulp.src(`${STYLES}/*.scss`)
      .pipe(scss(options))
      .pipe(gulp.dest(`${DIST}${_STYLES}`));
    resolve();
  });
});

gulp.task('scripts', () => {
  return new Promise(resolve => {
    gulp.src(`${SCRIPTS}/*.js`)
      .pipe(uglify({mangle: true}))
      .pipe(gulp.dest(`${DIST}${_SCRIPTS}`));
    resolve();
  });
});
