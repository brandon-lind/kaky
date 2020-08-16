const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist-services'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new Dotenv()
  ]
};
