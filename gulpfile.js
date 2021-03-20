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

const {HTML, STYLES, IMAGES, SCRIPTS, JSON, DIST} = PATH;
    };
const clean = _ => {
  return del(DIST, {force: true});
};

const styles = _ => {
  const options = {
    outputStyle: 'nested',
    indentType: 'space',
    indentWidth: 4,
    precision: 8,
    sourceComments: false
  };
  return gulp
    .src(`**/*.scss`, {
      cwd: path.join(STYLES)
    })
    .pipe(scss(options))
    .pipe(gulp.dest(path.join(DIST, STYLES)));
};

const scripts = _ => {
  return gulp
    .src([
      '**/*.js',
      '!{libs,plugins}/**/*.js'
    ], {
      cwd: path.join(SCRIPTS)
    })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(uglify({mangle: true}))
    .pipe(gulp.dest(path.join(DIST, SCRIPTS)));
};

const json = _ => {
  return gulp
    .src('**/*.json', {
      cwd: path.join(JSON)
    })
    .pipe(gulp.dest(path.join(DIST, JSON)));
};

const images = _ => {
  return gulp
    .src('**/*.{png,jpg,jpeg,gif,svg,ico}', {
      cwd: path.join(IMAGES)
    })
    .pipe(gulp.dest(path.join(DIST, IMAGES)));
};

const tasks = {
  normal: gulp.series(
    clean,
    gulp.parallel(
      html,
      styles,
      scripts,
      images,
      json
    )
  )
};

gulp.task('default', tasks['normal']);
