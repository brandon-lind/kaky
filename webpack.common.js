const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/app/scripts/app.js'
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/app/assets/img'), to: path.resolve(__dirname, 'public/assets/img') }
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/app/index.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'assign.html',
      template: './src/app/assign.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'work-open.html',
      template: './src/app/work-open.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ],
  }
};
