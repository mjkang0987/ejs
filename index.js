const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const ejs = require('ejs');
const glob = require('glob');
const beautify = require('js-beautify');
const sassMiddleware = require('node-sass-middleware');
const postcssMiddleware = require('postcss-middleware');
const autoprefixer = require('autoprefixer');
const pkg = require('./package.json');
const port = pkg.port;
const os = require('os');
const interfaces = os.networkInterfaces();
const ips = Object.keys(interfaces);
let localIP;

const base = {
  SRC : 'src',
  DIST: 'dist',
  DIR : 'views'
};

const {SRC, DIST, DIR} = base;

app.set(DIR, `${__dirname}/${DIR}`);
app.set('view engine', ejs);

app.get('/', (req, res, next) => {
  const indexPath = path.join(SRC, 'index.ejs');
  const fm = matter.read(indexPath);
  const {data: fmData, content: fmContent} = fm;
  const {groups: fmGroups} = fmData;
  const keysGroups = Object.keys(fmGroups);

  const ejsOption = {
    root              : SRC,
    outputFunctionName: 'echo'
  };

  const pages = glob.sync(DIR + '/**/**/[^_]*.ejs', {
    cwd   : SRC,
    nosort: true,
    nodir : true
  });

  const indexData = {
    pkgInfo: pkg,
    list   : keysGroups.reduce((obj, group) => {
      obj[group] = {
        name : fmGroups[group],
        pages: []
      };

      return obj;
    }, {})
  };

  pages.forEach(page => {
    const pathObj = path.parse(page);
    const fullPath = path.join(SRC, page);
    const srcPath = '/' + pathObj.dir + '/' + pathObj.name;
    const token = srcPath.replace(/\//g, '-').slice(1);
    const pageFm = matter.read(fullPath);
    const {data: fmData} = pageFm;
    const {name: fmName, group: fmGroup, state} = fmData;
    const states = Object.assign({
      'default': fmName + ' 기본'
    }, (state || {}));


    if (!fmGroup || !fmGroup in indexData.list || !indexData.list[fmGroup]) {
      return;
    }

    const pageData = Object.keys(states).reduce((acc, curr) => {
      const isDefault = curr === 'default';
      const isUnexposedPage = states[curr][0] === '_';
      const stateName = isUnexposedPage ? states[curr].substr(1) : states[curr];

      const stateData = {
        text     : stateName,
        token    : token,
        href     : srcPath,
        unexposed: isUnexposedPage
      };

      if (!isDefault) {
        stateData.token += `-${curr}`;
        stateData.href += `.${curr}`;
      }

      stateData.href += '.html';
      acc.states = acc.states.concat(stateData);

      return acc;
    }, {
      states: []
    });

    pageData.name = fmName;
    pageData.path = srcPath;
    indexData.list[fmGroup].pages.push(pageData);
  });

  const render = ejs.render(fmContent, indexData, ejsOption);
  const beautified = beautify.html(render, pkg.htmlBeautify);
  res.end(beautified);
});

app.get(`/views/**/?*.html`, (req, res, next) => {
  const pathObj = path.parse(req.path);
  const fileState = pathObj.name.split('.');
  const targetFile = fileState[0];
  const targetPath = path.join(__dirname, SRC, pathObj.dir, targetFile + '.ejs');
  const ejsOption = {
    root              : path.join(__dirname, DIR),
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
        page    : fm.data,
        data    : {},
        state   : fileState[1] || 'default',
        loadData: loadData
      };

      ejsOption.filename = targetPath;

      if (fm.data.data && Object.keys(fm.data.data).length) {
        fm.data.data.forEach((filePath) => {
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
      beautified = beautify.html(htmlString, pkg.htmlBeautify);
      res.end(beautified);
    }
  });
});

app.use(sassMiddleware({
  src           : path.join(__dirname, SRC, '/styles'),
  dest          : path.join(__dirname, DIST, SRC, '/styles'),
  prefix        : '/styles',
  debug         : false,
  outputStyle   : 'expanded',
  force         : true,
  response      : false,
  maxAge        : 0,
  sourceMapEmbed: false,
  includePaths  : [
    path.join(__dirname, SRC, '/styles')
  ]
}));

app.use('/styles', postcssMiddleware({
  src    : (req) => {
    return path.join(__dirname, 'styles', req.url);
  },
  plugins: [
    autoprefixer({
      remove : false,
      cascade: false
    }),
    (root) => {
      const first = root.first;
      const hasCharset = first.type === 'atrule' && first.name === 'charset';
      if (!hasCharset) {
        root.prepend(first);
      }
    }
  ]
}));

app.use('/styles', express.static(path.join(__dirname, DIST, SRC, '/styles')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/scripts', express.static(path.join(__dirname, SRC, '/scripts')));
app.use('/data', express.static(path.join(__dirname, '/data')));
// app.use('/scripts', express.static(path.join(__dirname, DIST, SRC, '/scripts')));

ips.map(ip => {
  interfaces[ip].filter(_ip => {
    if (_ip.family === 'IPv4' && _ip.internal === false) {
      localIP = _ip.address;
    }
  });
});

app.listen(port, _ => {
  console.log(`
(\\_(\\   ~ server started 🔥
(=' :')   http://${localIP}:${port}   
(,(')(')  http://localhost:${port}`);
});
