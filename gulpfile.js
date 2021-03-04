const gulp = require('gulp');
const scss = require('gulp-sass');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const del = require('del');

const PATH = {
  HTML: '/views',
  STYLES: './styles',
  IMAGES: './images',
  SCRIPTS: './scripts',
  DIST: './dist',
  _HTML: '/views',
  _STYLES: '/styles',
  _IMAGES: '/images',
  _SCRIPTS: '/scripts'
};

const {HTML, STYLES, IMAGES, SCRIPTS, DIST, _HTML, _STYLES, _IMAGES, _SCRIPTS} = PATH

gulp.task('clean', () => {
  return new Promise(resolve => {
    del.sync(DIST, {force: true});
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
    };
    gulp.src(`${PATH.STYLES}/*.scss'`)
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
