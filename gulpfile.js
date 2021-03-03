const gulp = require('gulp');
const scss = require('gulp-sass');
const del = require('del');

const PATH = {
  HTML: '/views',
  STYLES: './styles',
  IMAGES: './images',
  DIST: './dist',
  _HTML: '/views',
  _STYLES: '/styles',
  _IMAGES: '/images'
};

const {HTML, STYLES, IMAGES, DIST, _HTML, _STYLES, _IMAGES} = PATH

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
gulp.task('default', gulp.series(['styles']));
