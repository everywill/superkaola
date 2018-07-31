const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.config');
const config = require('../lib/config')

Object.keys(baseWebpackConfig.entry).forEach((name) => {
    baseWebpackConfig.entry[name] = [`webpack-hot-middleware/client?path=/${config.HMR_PATH}&quiet=true`].concat(baseWebpackConfig.entry[name]);
});

module.exports = merge(baseWebpackConfig, {
    watch: true,
    module: {
        rules: [
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
});
