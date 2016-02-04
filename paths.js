var paths = {
    outFilename: 'powerbi.js',
    outMinFilename: 'powerbi.min.js',
    jsSource: ['./src/embed.js', './src/tile.js', './src/report.js', './src/util.js', './src/core.js'],
    specSource: './test/**/*.spec.js',
    jsDest: './dist/'
};

paths.vendorSource = ['./bower_components/jquery/dist/jquery.js'];
paths.karmaFiles = paths.jsSource
    .concat(paths.vendorSource)
    .concat(paths.specSource);

module.exports = paths;