const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const basedir = path.join(__dirname, '..');

module.exports = async ({ config, mode }) => {
    config.module.rules.push(
        {
            test: /\.md?$/,
            loader: "markdown-loader",
        }
    );

    config.plugins.push(new ForkTsCheckerWebpackPlugin());

    // disable the hint about too big bundle
    config.performance.hints = false;

    return config;
};