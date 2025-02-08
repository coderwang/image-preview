const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/webview/index.tsx',
    output: {
        path: path.resolve(__dirname, 'out', 'webview'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    }
};
