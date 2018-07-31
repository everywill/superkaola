const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const getBaseConfig = require('./webpack.base.config')
const cs = require('../lib/console')
const helper = require('../lib/helper')

const PROD = process.env.SUPERKAOLA_ENV === 'production';

function resolve(file) {
    return path.join(process.env.SUPERKAOLA_ROOT, file);
}

const getWebpackConfig = (buildInfo) => {
    const baseConfig = getBaseConfig(buildInfo)
    const config = Object.assign({}, baseConfig, {
        mode: 'production',
        output: {
            path: baseConfig.output.path,
            filename: PROD ? '[name]_[chunkhash].dll.js' : '[name].dll.js',
            library: PROD ? '[name]_[chunkhash]' : '[name]',
        },
    })

    config.plugins = config.plugins.concat([
        new webpack.DllPlugin({
            context: path.join(resolve('node_modules'), '.super-kaola'),
            path: path.join(resolve('node_modules'), '.super-kaola', '[name]-manifest.json'),
            name: PROD ? '[name]_[chunkhash]' : '[name]',
        }),
        new MiniCssExtractPlugin({
            filename: PROD ? '[name]_[contenthash].dll.css' : '[name].dll.css',
            chunkFilename: PROD ? '[id]_[contenthash].dll.css' : '[id].dll.css',
        }),
    ])

    try {
        config.entry = require(path.join(info.root, buildInfo.dllModule)); // eslint-disable-line
    } catch (ex) {
        cs.log(ex);
        cs.log('Please check dllModules in superman.json', 'error');
        helper.stop(true);
    }
}

module.exports = getWebpackConfig
