module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS'],
        files: [
            { pattern: 'test-context.js', watched: false }
        ],
        frameworks: ['jasmine'],
        preprocessors: {
            'test-context.js': ['webpack']
        },
        webpack: {
            module: {
                rules: [
                    { test: /\.js/, exclude: /node_modules/, loader: 'babel-loader?presets[]=@babel/preset-env' }
                ]
            },
            watch: true
        },
        webpackServer: {
            noInfo: true
        }
    });
};
