const path = require('path');
const gulp = require('gulp');
const ejs = require('gulp-ejs');
const gulpData = require('gulp-data');
const prettify = require('gulp-prettify');
const frontMatter = require('gulp-front-matter');
const htmlHint = require('gulp-htmlhint');
const scss = require('gulp-sass');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const pluck = require('gulp-pluck');
const babel = require('gulp-babel');
const del = require('del');
const fs = require('fs');
const pkg = require('./package.json');

const PATH = {
  HTML   : 'src/views',
  STYLES : 'src/styles',
  SCRIPTS: 'src/scripts',
  DIST   : 'dist'
};

const {HTML, STYLES, SCRIPTS, DIST} = PATH;

const html = _ => {
  const _prettier = pkg.htmlBeautify;
  const _frontMatter = {
    property: 'fm',
    remove  : true
  };
  const htmlLint = pkg.htmlhint;
  const _rename = {extname: '.html'};

  const generatePages = page => {
    const fm = page.fm;
    let dataPaths = fm.data;
    let dataPath;
    const data = {};

    const basePath = path.resolve(page.cwd, HTML);
    const srcPath = page.path.replace(basePath, '')
      .replace(/\.[^/\\.]+$/, '')
      .split(path.sep)
      .join('/');
    const isPartialPage = path.basename(srcPath)
      .substring(0, 2) === '__';

    if (dataPaths) {
      if (!Array.isArray(dataPaths)) {
        dataPaths = [dataPaths];
      }
    } else {
      dataPaths = [];
    }

    for (let i = 0, len = dataPaths.length; i < len; i++) {
      dataPath = path.join(__dirname, dataPaths[i]);

      if (!fs.existsSync(dataPath)) {
        continue;
      }

      delete require.cache[require.resolve(dataPath)];
      data[path.parse(dataPath).name] = require(dataPath);
    }

    const loadData = dataPath => {
      const fileFullPath = path.join(__dirname, dataPath);
      const basename = path.basename(dataPath);
      const extname = path.extname(dataPath);
      let parsedStr;

      if (extname !== '.json') {
        console.log(basename + ' is not JSON file.');
        return;
      }

      if (fs.existsSync(fileFullPath)) {
        parsedStr = require(fileFullPath);
      } else {
        console.log(dataPath + ' file does not exist.');
        return;
      }

      return parsedStr;
    };

    let _gulp = gulp
      .src(page.path)
      .pipe(frontMatter())
      .pipe(ejs({
          page: fm,
          data: data,
          loadData
        },
        {
          root              : path.join(__dirname, HTML),
          outputFunctionName: 'echo'
        }))
      .pipe(rename(_rename));

    if (!isPartialPage) {
      _gulp = _gulp
        .pipe(htmlHint(htmlLint))
        .pipe(htmlHint.reporter());
    }

    _gulp = _gulp
      .pipe(prettify(_prettier));

    if (isPartialPage) {
      _gulp = _gulp
        .pipe(rename(path => {
          path.basename = path.basename.replace(/^__/, '');
        }));
    }

    _gulp.pipe(gulp.dest(path.join(DIST, HTML)));

    return _gulp;
  };

  return gulp
    .src([
      '*/*/*/**.ejs',
      path.join('!' + HTML, '_!(_)*.ejs'),
      path.join('!' + HTML, 'components/*.ejs')
    ])
    .pipe(frontMatter(_frontMatter))
    .pipe(gulpData(generatePages))
    .pipe(pluck('fm'));
};

const clean = _ => {
  return del(DIST, {force: true});
};

const styles = _ => {
  const options = {
    outputStyle   : 'nested',
    indentType    : 'space',
    indentWidth   : 4,
    precision     : 8,
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
    .pipe(babel())
    .pipe(eslint.format())
    .pipe(uglify({mangle: true}))
    .pipe(gulp.dest(path.join(DIST, SCRIPTS)));
};

const tasks = {
  normal: gulp.series(
    clean,
    gulp.parallel(
      html,
      styles,
      scripts
    )
  )
};

gulp.task('default', tasks['normal']);
