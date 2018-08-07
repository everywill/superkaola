const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const getBaseConfig = require('./webpack.base.config')
const config = require('../lib/config')

const PROD = process.env.SUPERKAOLA_ENV === 'production'

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
            new HtmlWebpackPlugin({
                filename: PROD ? path.join(buildInfo.root, buildInfo.html.output) : 'index.html',
                template: path.join(buildInfo.root, buildInfo.html.template),
                inject: true,
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    // more options:
                    // https://github.com/kangax/html-minifier#options-quick-reference
                },
                // necessary to consistently work with multiple chunks via CommonsChunkPlugin
                chunksSortMode: 'none',
            }),
            new AddAssetHtmlPlugin([{
                filepath: path.resolve(buildInfo.root, baseConfig.output.path, '*.dll.js'),
                includeSourcemap: false,
            }, {
                filepath: path.resolve(buildInfo.root, baseConfig.output.path, '*.dll.css'),
                includeSourcemap: false,
                typeOfAsset: 'css',
            }]),
        ],
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'async',
                name: true,
                cacheGroups: {
                    default: false,
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
    })

    Object.keys(wbpConfig.entry).forEach((name) => {
        wbpConfig.entry[name] = [`${require.resolve('webpack-hot-middleware/client')}?path=/${config.HMR_PATH}&quiet=true`].concat(wbpConfig.entry[name]);
    })

    return wbpConfig
}

module.exports = getWebpackConfig
