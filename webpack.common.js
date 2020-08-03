const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/app/scripts/app.js'
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  resolve: {
    alias: {
      Images: path.resolve(__dirname, 'src/app/assets/img')
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
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
