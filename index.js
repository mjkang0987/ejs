const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const ejs = require('ejs');
const beautify = require('js-beautify');
const sassMiddleware = require('node-sass-middleware');
const postcssMiddleware = require('postcss-middleware');
const autoprefixer = require('autoprefixer');
const port = 3000;

const base =  {
  'dist': 'dist',
  'dir': 'views'
};

const {dist, dir} = base;

app.set('views', `${__dirname}/views`);
app.set('view engine', ejs);

app.get('/index', (req, res) => {
  fs.readFile(`${__dirname}/data/items.json`, (err, data) => {
    const jsonData = JSON.parse(data);
    res.render('pages/index', {jsonData});
  });
});

app.get('/list', (req, res) => {
  fs.readFile(`${__dirname}/data/filter.json`, (err, data) => {
    const jsonData = JSON.parse(data);
    res.render('pages/list', {jsonData});
  });
});

app.use(sassMiddleware({
  src: path.join(__dirname),
  dest: path.join(__dirname, 'dist'),
  debug: true,
  outputStyle: 'expanded',
  force: true,
  response: false,
  maxAge: 0,
  sourceMapEmbed: true,
  includePaths: [
    path.join(__dirname, 'styles')
  ]
}));

app.use('/styles', postcssMiddleware({
  src: (req) => {
    return path.join(__dirname, req.path);
  },
  plugins: [
    autoprefixer({
      remove: false,
      cascade: false
    })
  ]
}));

app.use('/styles', express.static(path.join(__dirname, 'dist/styles')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.listen(port, _ => {
  console.log(`
(\\_(\\
(=' :') ~ server started http://localhost:${port}   
(,(')(')`);
})

