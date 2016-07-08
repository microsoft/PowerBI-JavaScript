module.exports = {  
  entry: './src/powerbi.ts',
  output: {
    path: __dirname + "/dist",
    filename: 'powerbi.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
}