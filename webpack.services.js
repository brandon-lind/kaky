const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [new Dotenv()],
  optimization: { minimize: false }
};
