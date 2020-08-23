const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/ui/scripts/app.js'
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist-ui'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/ui/assets/img'), to: path.resolve(__dirname, 'dist-ui/assets/img') }
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/ui/index.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'assign.html',
      template: './src/ui/assign.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'work-open.html',
      template: './src/ui/work-open.html'
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
