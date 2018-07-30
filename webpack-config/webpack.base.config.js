const path = require('path')
const _ = require('lodash');
const webpack = require('webpack')
const os = require('os')
const HappyPack = require('happypack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const conf = require('../lib/config')

const PROD = process.env.SUPERKAOLA_ENV === 'production'

const happyThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length
});

function resolve(file) {
    return path.join(process.env.SUPERKAOLA_ROOT, file)
}

function getEnvConf(buildInfo) {
    const jsBuild = _.get(buildInfo, 'buildInfo.js.build')
    const cssBuild = _.get(buildInfo, 'buildInfo.css.build')
    const jsLocal = _.get(buildInfo, 'buildInfo.js.local', path.join(buildInfo.root, 'local'))
    const cssLocal = _.get(buildInfo, 'buildInfo.css.local', path.join(buildInfo.root, 'local'))
    const publicPath = _.get(buildInfo, 'buildInfo.publicPath')

    let cssDist
    let outputPath
    let filename
    let chunkFilename
    let publicPath

    if (PROD) {
        cssDist = `${path.relative(jsBuild, cssBuild)}/[name]_[contenthash].css`
        outputPath = jsBuild
        filename = '[name]_[chunkhash].js'
        chunkFilename = '[name]_[chunkhash].js'
    } else {
        cssDist = `${path.relative(jsLocal, cssLocal)}/[name].css`
        outputPath = jsLocal
        filename = '[name].js'
        chunkFilename = '[name].js'
    }

    return {
        cssDist,
        output: {
            path: outputPath,
            publicPath,
            filename,
            chunkFilename
        }
    }
}

const getBaseConfig = (buildInfo) => {
    const envConf = getEnvConf(buildInfo);

    const config = {
        mode: process.env.SUPERKAOLA_ENV,
        // 占位
        entry: {},
        output: envConf.output,
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: buildInfo.resolveAlias || {
                vue$: 'vue/dist/vue.esm.js',
                '@': resolve('src')
            }
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.js$/,
                    loader: 'happypack/loader?id=babel',
                    include: [
                        resolve('src')
                    ],
                    exclude: file => (
                        /node_modules/.test(file) &&
                        !/\.vue\.js/.test(file)
                    )
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(woff2?|eot|ttf|otf|png|gif|jpeg|jpg|svg)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000
                    }
                }
            ]
        },
        plugins: [
            new VueLoaderPlugin(),
            new HappyPack({
                id: 'babel',
                threadPool: happyThreadPool,
                loaders: [{
                    loader: 'babel-loader'
                }]
            }),
            new MiniCssExtractPlugin({
                filename: PROD ? '[name]_[contenthash].css' : '[name].css',
                chunkFilename: PROD ? '[id]_[contenthash].css' : '[id].css'
            }),
            new webpack.DllReferencePlugin({
                context: path.join(resolve('node_modules'), '.super-kaola'),
                manifest: require(path.join(resolve('node_modules'), '.super-kaola', 'base-manifest.json'))
            }),
            new HtmlWebpackPlugin({
                filename: PROD ? resolve('../server/app/view/index.html') : 'index.html',
                template: path.join(__dirname, '../..', 'index.html'),
                inject: true,
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true
                    // more options:
                    // https://github.com/kangax/html-minifier#options-quick-reference
                },
                // necessary to consistently work with multiple chunks via CommonsChunkPlugin
                chunksSortMode: 'dependency'
            }),
            new AddAssetHtmlPlugin([{
                filepath: path.resolve(PROD ? resolve('../server/app/public') : resolve('local'), '*.dll.js'),
                includeSourcemap: false
            }, {
                filepath: path.resolve(PROD ? resolve('../server/app/public') : resolve('local'), '*.dll.css'),
                includeSourcemap: false,
                typeOfAsset: 'css'
            }])
        ]
    }

    return config
}

module.exports = getBaseConfig
