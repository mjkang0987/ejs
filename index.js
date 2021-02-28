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

const htmlBeautify = {
  "end_with_newline": true,
  "unformatted": true,
  "preserve_newlines": true,
  "max_preserve_newlines": 0,
  "indent_inner_html": true,
  "extra_liners": [],
  "indent_size": 2,
  "brace_style": "collapse",
  "wrap_line_length": 100
}

app.set(dir, `${__dirname}/${dir}`);
app.set('view engine', ejs);

app.get('/index', (req, res) => {
  fs.readFile(`${__dirname}/data/items.json`, (err, data) => {
    const jsonData = JSON.parse(data);
    res.render('pages/index', {jsonData});
  });
});
app.get(`/${dir}/**/?*.html`, (req, res, next) => {
  const pathObj = path.parse(req.path);
  const fileState = pathObj.name.split('.');
  const targetFile = fileState[0];
  const targetPath = path.join(__dirname, pathObj.dir, targetFile + '.ejs');
  const ejsOption = {
    root: path.join(__dirname, dir),
    outputFunctionName: 'echo'
  };

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
      parsedStr = JSON.parse(fs.readFileSync(fileFullPath));
    } else {
      console.log(dataPath + ' file does not exist.');
      return;
    }

    return parsedStr;
  };

  fs.readFile(targetPath, (err, data) => {
    let fm;
    let renderData;
    let htmlString;
    let beautified;

    if (err) {
      next();
    } else {
      fm = matter(data.toString());
      renderData = {
        page: fm.data,
        data: {},
        loadData: loadData
      };

      ejsOption.filename = targetPath;

      if (fm.data.data && Object.keys(fm.data.data).length) {
        fm.data.data.forEach(function(filePath) {
          const fileName = path.basename(filePath, '.json');
          const fileFullPath = path.join(__dirname, filePath);
          let parsedStr;

          if (fs.existsSync(fileFullPath)) {
            parsedStr = fs.readFileSync(fileFullPath);
            renderData.data[fileName] = JSON.parse(parsedStr);
          }
        });
      }

      res.set('Content-Type', 'text/html');
      htmlString = ejs.render(fm.content, renderData, ejsOption);
      beautified = beautify.html(htmlString, htmlBeautify);
      res.end(beautified);
    }
  });
})

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

