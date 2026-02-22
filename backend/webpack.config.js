const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = function (options) {
    return {
        ...options,
        externals: [nodeExternals()],
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        output: {
            ...options.output,
            path: path.resolve(__dirname, 'dist'),
        },
    };
};
