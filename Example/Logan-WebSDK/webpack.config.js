var path = require('path');
const DEMO_PATH = './demo';
const STATIC_JS = 'js';
const PUBLIC_PATH = './' + STATIC_JS + '/';
module.exports = [
    {
        mode: 'production',
        entry: {
            'test': ['./src/test.js']
        },
        output: {
            path: path.join(__dirname, DEMO_PATH, STATIC_JS),
            publicPath: PUBLIC_PATH,
            filename: '[name].js',
            chunkFilename: '[name].[chunkhash].js',
        },
        resolve: {
            extensions: ['.js']
        },
        module: {
            rules: []
        }
    }
];
