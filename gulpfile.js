const gulp = require('gulp');
const scss = require('gulp-sass');

const PATH = {
  HTML: '/views',
  STYLES: './styles',
  IMAGES: './images',
  DIST: './dist',
  _HTML: '/views',
  _STYLES: '/styles',
  _IMAGES: '/images'
};

gulp.task('styles', () => {
  return new Promise(resolve => {
    const options = {
      outputStyle: 'nested',
      indentType: 'space',
      indentWidth: 4,
      precision: 8,
      sourceComments: false
    };
    gulp.src(PATH.STYLE + '/*.scss')
      .pipe(scss(options))
      .pipe(gulp.dest(DEST_PATH.STYLE));
    resolve();
  });
});
gulp.task('default', gulp.series(['styles']));
