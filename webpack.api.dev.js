const { merge } = require('webpack-merge');
const common = require('./webpack.api.common.js');

module.exports = merge(common, {
  mode: 'development',
  optimization: {
    minimize: false
  }
});
