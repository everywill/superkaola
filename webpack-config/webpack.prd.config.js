const path = require('path')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const getBaseConfig = require('./webpack.base.config')

const PROD = process.env.SUPERKAOLA_ENV === 'production'

const getWebpackConfig = (buildInfo) => {
    const baseConfig = getBaseConfig(buildInfo)
    const wbpConfig = merge.strategy({})(baseConfig, {
        module: {
            rules: [
            ],
        },
        plugins: [
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
                filepath: path.resolve(buildInfo.root, PROD ? baseConfig.output.path : 'local', '*.dll.js'),
                includeSourcemap: false,
            }, {
                filepath: path.resolve(buildInfo.root, PROD ? baseConfig.output.path : 'local', '*.dll.css'),
                includeSourcemap: false,
                typeOfAsset: 'css',
            }]),
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
