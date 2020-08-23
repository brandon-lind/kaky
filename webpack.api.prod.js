const { merge } = require('webpack-merge');
const common = require('./webpack.api.common.js');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true
  }
});
