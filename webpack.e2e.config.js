module.exports = {
  entry: './e2e/protocol.e2e.spec.ts',
  output: {
    path: __dirname + "/tmp",
    filename: 'protocol.e2e.spec.js'
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
  ts: {
    configFileName: "webpack.e2e.tsconfig.json"
  }
}