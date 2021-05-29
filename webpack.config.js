const path = require('path');
const glob = require('glob-all');
const {CleanWebpackPlugin: cleanWebpackPlugin} = require('clean-webpack-plugin');
const uglifyPlugin = require('uglifyjs-webpack-plugin');
const miniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const pkg = require('./package.json');

const PATH = {
  HTML   : 'views',
  STYLES : 'styles',
  SCRIPTS: 'scripts',
  IMG    : 'images',
  DIST   : 'dist',
  SRC    : 'src',
  VIEWS  : 'views'
};

const {HTML, STYLES, SCRIPTS, IMG, DIST, SRC, VIEW} = PATH;

const entries = glob.sync([
  `${SCRIPTS}/[^plugins]*/*.js`,
  `${STYLES}/**/[^_]*.scss`
], {
  cwd   : SRC,
  nosort: true,
  nodir : true
});

const entriesObj = entries.reduce((acc, item) => {
  acc[item.replace(/\.scss|.js/g, '')] = `./src/${item}`;
  return acc;
}, {});

module.exports = {
  mode   : 'development',
  entry  : entriesObj,
  output : {
    filename  : '[name].js',
    path      : path.resolve(__dirname, DIST),
    publicPath: '/',
  },
  devtool: false,
  module : {
    rules: [
      {
        test   : /\.m?js$/,
        exclude: /(node_modules|dist)/,
        use    : {
          loader : 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      },
      {
        test   : /\.(sass|scss)$/,
        exclude: /(node_modules|dist)/,
        use    : [
          miniCssExtractPlugin.loader,
          {
            loader : 'css-loader',
            options: {
              importLoaders: 2,
            },
          },
          {
            loader : 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'autoprefixer'
                  ]
                ]
              }
            }
          },
          {
            loader : 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test   : /\.(ico|png|jpg|jpeg|gif|svg|)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader : 'url-loader',
        options: {
          name : `${IMG}/[hash].[ext]`,
          limit: 10000,
        }
      },
      {
        test   : /\.js$/,
        exclude: /node_modules/,
        loader : 'eslint-loader',
        options: {
          // eslint options (if necessary)
        }
      },
    ]
  },
  resolve: {
    modules   : ['node_modules'],
    extensions: ['.js', '.scss'],
  },
  plugins: [
    new cleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['dist']
    }),
    new uglifyPlugin({
      cache    : true,
      parallel : true,
      sourceMap: true
    }),
    new miniCssExtractPlugin({
      filename     : '[id].css',
      chunkFilename: '[id][hash].css',
      ignoreOrder  : false,
    }),
  ],
};
