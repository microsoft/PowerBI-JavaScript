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
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  },
  ts: {
    configFileName: "webpack.e2e.tsconfig.json"
  }
}