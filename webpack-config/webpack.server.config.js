const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const VueSSRPlugin = require('vue-ssr-webpack-plugin')
const getBaseConfig = require('./webpack.base.config')

const getWebpackConfig = (buildInfo) => {
    const baseConfig = getBaseConfig(buildInfo)
    const wbpConfig = merge.strategy({})(baseConfig, {
        target: 'node',
        plugins: [
            new VueSSRPlugin(),
        ],
    })

    return wbpConfig
}

module.exports = getWebpackConfig
