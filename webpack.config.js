var package = require('./package.json');

module.exports = {
  entry: {
    'powerbi': './src/powerbi-client.ts'
  },
  output: {
    globalObject: "this",
    path: __dirname + "/dist",
    filename: '[name].js',
    library: package.name,
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.map$/, loader: 'ignore-loader' },
      { test: /\.d.ts$/, loader: 'ignore-loader' },
      { test: /\.ts$/, exclude: /\.d.ts$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  }
}