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
