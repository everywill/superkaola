const merge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const getBaseConfig = require('./webpack.base.config')

const getWebpackConfig = (buildInfo) => {
    const baseConfig = getBaseConfig(buildInfo)
    const wbpConfig = merge.strategy({})(baseConfig, {
        module: {
            rules: [
            ],
        },
        plugins: [
        ],
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                }),
                new OptimizeCSSAssetsPlugin({}),
            ],
        },
    })

    return wbpConfig
}

module.exports = getWebpackConfig
