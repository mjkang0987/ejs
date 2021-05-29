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
  src: 'src',
  dist: 'dist',
  dir : 'views'
};

const {src, dist, dir} = base;

app.set(dir, `${__dirname}/${dir}`);
app.set('view engine', ejs);

app.get('/', (req, res, next) => {
  const indexPath = path.join(src, 'index.ejs');
  const fm = matter.read(indexPath);
  const {data: fmData, content: fmContent} = fm;
  const {groups: fmGroups} = fmData;
  const keysGroups = Object.keys(fmGroups);

  const ejsOption = {
    root              : src,
    outputFunctionName: 'echo'
  };

  const pages = glob.sync(dir + '/**/**/[^_]*.ejs', {
    cwd   : src,
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
    const fullPath = path.join(src, page);
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

    const pageData = Object.keys(states).reduce((before, state) => {
      const isDefault = state === 'default';
      const isUnexposedPage = states[state][0] === '_';
      const stateName = isUnexposedPage ? states[state].substr(1) : states[state];

      const stateData = {
        text     : stateName,
        token    : token,
        href     : srcPath,
        unexposed: isUnexposedPage
      };

      if (!isDefault) {
        stateData.token += `-${state}`;
        stateData.href += `.${state}`;
      }

      stateData.href += '.html';
      before.states = before.states.concat(stateData);


      return before;
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

app.get(`/views/**/?*.html`, function(req, res, next) {
  const pathObj = path.parse(req.path);
  const fileState = pathObj.name.split('.');
  const targetFile = fileState[0];
  const targetPath = path.join(__dirname, src, pathObj.dir, targetFile + '.ejs');
  const ejsOption = {
    root              : path.join(__dirname, dir),
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
  src           : path.join(__dirname, src, '/styles'),
  dest          : path.join(__dirname, 'dist/styles'),
  prefix        : '/styles',
  debug         : false,
  outputStyle   : 'expanded',
  force         : true,
  response      : false,
  maxAge        : 0,
  sourceMapEmbed: false,
  includePaths  : [
    path.join(__dirname, src, '/styles')
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

app.use('/styles', express.static(path.join(__dirname, dist, '/styles')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/scripts', express.static(path.join(__dirname, src, '/scripts')));

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
