const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
    writeToDisk: true,
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:9000',
        'pathRewrite': {
          '^/\\.netlify/functions': ''
        }
      }
    }
  },
});
