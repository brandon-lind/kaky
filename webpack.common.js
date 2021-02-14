const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/ui/scripts/app.js')
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist-ui'),
  },
  resolve: {
    alias: {
        jquery: 'jquery-slim/dist/jquery.slim.js'
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new Visualizer(),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/ui/assets/img'), to: path.resolve(__dirname, 'dist-ui/assets/img') },
        { from: path.resolve(__dirname, 'src/ui/assets/styles'), to: path.resolve(__dirname, 'dist-ui/assets/styles') }
      ]
    }),
    new ImageMinimizerPlugin({
      minimizerOptions: {
        plugins: [
          ['gifsicle', { interlaced: true }],
          ['jpegtran', { progressive: true }],
          ['optipng', { optimizationLevel: 5 }],
          [
            'svgo',
            {
              plugins: [
                {
                  removeViewBox: false,
                },
              ],
            },
          ],
        ],
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src/ui/index.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'work-requests/assign.html',
      template: path.resolve(__dirname, 'src/ui/work-requests/assign.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'work-requests/detail.html',
      template: path.resolve(__dirname, 'src/ui/work-requests/detail.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'work-requests/index.html',
      template: path.resolve(__dirname, 'src/ui/work-requests/index.html')
    }),

    new HtmlWebpackPlugin({
      filename: 'work-requests/list.html',
      template: path.resolve(__dirname, 'src/ui/work-requests/list.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'work-requests/submitted.html',
      template: path.resolve(__dirname, 'src/ui/work-requests/submitted.html')
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: ['file-loader']
      }
    ],
  }
};
