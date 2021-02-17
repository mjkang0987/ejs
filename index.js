const express = require('express');
const app = express();
const ejs = require('ejs');
const sassMiddleware = require('node-sass-middleware');
const port = 3000;

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(sassMiddleware({
  src: `${__dirname}/styles`,
  dest: `dist/styles`,
  debug: true,
  outputStyle: 'expanded'
}));

app.use('/styles', postcssMiddleware({
  plugins: [
    autoprefixer({
      remove: false,
      cascade: false
    }),
    function(root, result) {
      var first = root.first;
      var hasCharset = first.type === 'atrule' && first.name === 'charset';
      var cssBanner = '/*!' + banner + '*/';

      if (hasCharset) {
        root.first.after('\n' + cssBanner);
      } else {
        root.prepend(cssBanner);
      }
    }
  ],
  options: {
    map: {
      inline: true
    }
  },
  src: function(req) {
    return path.join(dist, 'styles', req.url);
  }
}));

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(port, _ => {
  console.log(`
(\\_(\\       
(=' :') ~ ♡   
(,(')(')
http://localhost:${port}`);
})

