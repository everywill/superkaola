const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.config');

Object.keys(baseWebpackConfig.entry).forEach((name) => {
    baseWebpackConfig.entry[name] = ['webpack-hot-middleware/client?path=/__super_kaola_hmr__&quiet=true'].concat(baseWebpackConfig.entry[name]);
});

module.exports = merge(baseWebpackConfig, {
    watch: true,
    module: {
        rules: [
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});
