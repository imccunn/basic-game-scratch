'use strict';

module.exports = {
  context: __dirname + '/src/js/',
  entry: './index.js',
  output: {
    path: __dirname + '/build/js/',
    filename: 'dist.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader' }
    ]
  },
  devServer: {
    contentBase: './src/',
    compress: true,
    port: 8080
  }
};
