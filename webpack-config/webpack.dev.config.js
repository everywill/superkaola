const webpack = require('webpack')
const merge = require('webpack-merge')
const getBaseConfig = require('./webpack.base.config')
const config = require('../lib/config')

const getWebpackConfig = (buildInfo) => {
    const baseConfig = getBaseConfig(buildInfo)
    const wbpConfig = merge.strategy({})(baseConfig, {
        watch: true,
        module: {
            rules: [
            ],
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
        ],
    })

    Object.keys(wbpConfig.entry).forEach((name) => {
        wbpConfig.entry[name] = [`${require.resolve('webpack-hot-middleware/client')}?path=/${config.HMR_PATH}&quiet=true`].concat(wbpConfig.entry[name]);
    })

    return wbpConfig
}

module.exports = getWebpackConfig
