const gulp = require('gulp');
const scss = require('gulp-sass');

const PATH = {
    IMAGES: './images',
    STYLE: './styles'
  },
  DEST_PATH = {
    IMAGES: './dist/images',
    STYLE: './dist/styles'
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
