const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/ui/scripts/app.js')
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist-ui'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/ui/assets/img'), to: path.resolve(__dirname, 'dist-ui/assets/img') },
        { from: path.resolve(__dirname, 'src/ui/assets/styles'), to: path.resolve(__dirname, 'dist-ui/assets/styles') }
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'work-requests/index.html',
      template: path.resolve(__dirname, 'src/ui/work-requests/index.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'work-requests/assign.html',
      template: path.resolve(__dirname, 'src/ui/work-requests/assign.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'work-requests/submitted.html',
      template: path.resolve(__dirname, 'src/ui/work-requests/submitted.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'work-requests/work-open.html',
      template: path.resolve(__dirname, 'src/ui/work-requests/work-open.html')
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
