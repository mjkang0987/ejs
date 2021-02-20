const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const sassMiddleware = require('node-sass-middleware');
const postcssMiddleware = require('postcss-middleware');
const autoprefixer = require('autoprefixer');
const port = 3000;

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('pages/index')
});

app.get('/list', (req, res) => {
  res.render('pages/list')
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
app.listen(port, _ => {
  console.log(`
(\\_(\\
(=' :') ~ server started http://localhost:${port}   
(,(')(')`);
})

