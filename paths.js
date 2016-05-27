var paths = {
    outFilename: 'powerbi.js',
    outMinFilename: 'powerbi.min.js',
    jsSource: ['./src/embed.js', './src/tile.js', './src/report.js', './src/util.js', './src/core.js'],
    specSource: './test/**/*.spec.js',
    jsDest: './dist/'
};

paths.vendorSource = ['./node_modules/jquery/dist/jquery.js'];
paths.karmaFiles = paths.vendorSource
    .concat(['./dist/powerbi.js'])
    .concat(['./tmp/**/*.spec.js']);

module.exports = paths;