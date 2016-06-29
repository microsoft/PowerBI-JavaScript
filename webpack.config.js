var webpack = require('webpack');
var package = require('./package.json');
var banner = package.name + " v" + package.version + " | (c) 2016 Microsoft Corporation " + package.license;

module.exports = {
  entry: {
    'powerbi': './src/powerbi.ts'
  },
  output: {
    path: __dirname + "/dist",
    filename: '[name].js',
    library: package.name,
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.map$/, loader: 'ignore-loader' },
      { test: /\.d.ts$/, loader: 'ignore-loader' },
      { test: /\.ts$/, exclude: /\.d.ts$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(banner)
  ]
}