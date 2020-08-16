const { merge } = require('webpack-merge');
const common = require('./webpack.services.common.js');

module.exports = merge(common, {
  mode: 'development',
  optimization: {
    minimize: false
  }
});
