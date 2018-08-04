const path = require('path')
const os = require('os')
const fs = require('fs')
const _ = require('lodash')
const glob = require('glob')
const webpack = require('webpack')
const babelMerge = require('babel-merge')
const HappyPack = require('happypack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const cs = require('../lib/console')

const PROD = process.env.SUPERKAOLA_ENV === 'production'

const happyThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length,
});

function requireJSON(filepath) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    return data
}

function getEnvConf(buildInfo) {
    let jsBuild = _.get(buildInfo, 'buildInfo.js.build', 'superkaola-build')
    let cssBuild = _.get(buildInfo, 'buildInfo.css.build', jsBuild)
    let jsLocal = _.get(buildInfo, 'buildInfo.js.local', 'superkaola-local')
    let cssLocal = _.get(buildInfo, 'buildInfo.css.local', jsLocal)
    const publicPath = _.get(buildInfo, 'buildInfo.publicPath')

    jsBuild = path.join(buildInfo.root, jsBuild)
    jsLocal = path.join(buildInfo.root, jsLocal)
    cssBuild = path.join(buildInfo.root, cssBuild)
    cssLocal = path.join(buildInfo.root, cssLocal)

    let cssDist
    let outputPath
    let filename
    let chunkFilename

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
            chunkFilename,
        },
    }
}

function getProBabelConf(buildInfo) {
    let proBabelConf = {};
    if (buildInfo.extra.babelrc) {
        proBabelConf = requireJSON(path.join(buildInfo.root, buildInfo.extra.babelrc))
    }
    return proBabelConf
}

function scanJs(entry) {
    const files = glob.sync('/**/main.js*', {
        root: entry,
        ignore: [
            '/**/bower_components/**',
            '/**/node_modules/**',
            '/**/components/**',
        ],
    })

    return files
}

function getJsEntry(buildInfo) {
    const jsEntry = {}
    let jsSrc = _.get(buildInfo, 'js.src', '')

    if (!jsSrc) {
        return jsEntry
    }

    jsSrc = path.join(buildInfo.root, jsSrc)

    scanJs(jsSrc).forEach((item) => {
        let p = path.relative(jsSrc, path.resolve(item, '..'))
        p = p || 'app'
        jsEntry[p] = [`./${path.relative(process.cwd(), item)}`]
    })

    return jsEntry
}

function scanCss(entry) {
    const files = glob.sync('/**/*.scss', {
        root: entry,
        ignore: [
            '/**/_*',
            '/**/bower_components/**',
            '/**/node_modules/**',
        ],
    })

    return files;
}

function getCssEntry(buildInfo) {
    const cssEntry = {}
    let cssSrc = _.get(buildInfo, 'css.src', '')

    if (!cssSrc) {
        return cssEntry
    }

    cssSrc = path.join(buildInfo.root, cssSrc)

    let p
    scanCss(cssSrc).forEach((item) => {
        p = path.relative(cssSrc, item);
        p = p.slice(0, p.lastIndexOf('.'));
        p = p || 'app';
        cssEntry[p] = `./${path.relative(process.cwd(), item)}`;
    })

    return cssEntry
}

function getCommonEntry(buildInfo) {
    const entry = {};

    cs.log('Scanning entry files...', 'info')

    const jsEntry = getJsEntry(buildInfo)
    const cssEntry = getCssEntry(buildInfo)

    return Object.assign(entry, jsEntry, cssEntry)
}

const getBaseConfig = (buildInfo) => {
    const envConf = getEnvConf(buildInfo)
    const proBabelConf = getProBabelConf(buildInfo)
    const commonBabelConf = buildInfo.babelConf
    const commonEntry = getCommonEntry(buildInfo)

    buildInfo.html.output = buildInfo.html.output || 'index.html'
    buildInfo.html.template = buildInfo.html.template || 'index.html'

    const config = {
        mode: process.env.SUPERKAOLA_ENV,
        // 占位
        entry: commonEntry,
        output: envConf.output,
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: buildInfo.resolveAlias || {
                vue$: 'vue/dist/vue.esm.js',
                '@': path.join(buildInfo.root, 'src'),
            },
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                },
                {
                    test: /\.js$/,
                    loader: 'happypack/loader?id=babel',
                    exclude: file => (
                        /node_modules/.test(file) &&
                        !/\.vue\.js/.test(file)
                    ),
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                },
                {
                    test: /\.(woff2?|eot|ttf|otf|png|gif|jpeg|jpg|svg)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                    },
                },
            ],
        },
        plugins: [
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new VueLoaderPlugin(),
            new HappyPack({
                id: 'babel',
                threadPool: happyThreadPool,
                loaders: [{
                    loader: 'babel-loader',
                    options: babelMerge(commonBabelConf, proBabelConf),
                }],
            }),
            new MiniCssExtractPlugin({
                filename: PROD ? '[name]_[contenthash].css' : '[name].css',
                chunkFilename: PROD ? '[id]_[contenthash].css' : '[id].css',
            }),
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
                chunksSortMode: 'dependency',
            }),
            new AddAssetHtmlPlugin([{
                filepath: path.resolve(buildInfo.root, PROD ? envConf.output.outputPath : 'local', '*.dll.js'),
                includeSourcemap: false,
            }, {
                filepath: path.resolve(buildInfo.root, PROD ? envConf.output.outputPath : 'local', '*.dll.css'),
                includeSourcemap: false,
                typeOfAsset: 'css',
            }]),
            new webpack.ProgressPlugin((percentage, msg) => {
                if (percentage < 1) {
                    percentage = Math.floor(percentage * 100);
                    msg = ` ${percentage}% ${msg}`;
                }
                if (process.stdin.isTTY) {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(msg);
                }
            }),
        ],
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                name: true,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                    },
                },
            },
        },
    }

    if (buildInfo.needDll) {
        config.plugins.push(new webpack.DllReferencePlugin({
            context: path.join(buildInfo.root, 'node_modules', '.super-kaola'),
            manifest: require(path.join(buildInfo, 'node_modules', '.super-kaola', 'base-manifest.json')),
        }))
    }

    return config
}

module.exports = getBaseConfig
