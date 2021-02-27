const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    allowedHosts: [
      '.amazonaws.com'
    ],
    contentBase: './dist-ui',
    host: '0.0.0.0',
    writeToDisk: true,
    proxy: {
      '/.netlify/identity': {
        target: 'https://staging.kaky.us',
        changeOrigin: true
      },
      '/.netlify/functions': {
        target: 'http://localhost:9000'
      }
    }
  },
});
