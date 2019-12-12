var path = require('path');
const STATIC_JS = 'js';
const PUBLIC_PATH = './' + STATIC_JS + '/';
const DEMO_PATH = './demo';
module.exports = [
    {
        mode: 'production',
        entry: {
            'logan-web': ['./build/index.js']
        },
        output: {
            path: path.join(__dirname, DEMO_PATH, STATIC_JS),
            publicPath: PUBLIC_PATH,
            filename: '[name].js',
            chunkFilename: '[name].[chunkhash].js',
            library: 'Logan',
            libraryTarget: 'umd',
            crossOriginLoading: 'anonymous'
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        module: {
            rules: []
        },
        devServer: {
            hot: true,
            contentBase: DEMO_PATH,
            publicPath: PUBLIC_PATH,
            open: true
        }
    }
];
