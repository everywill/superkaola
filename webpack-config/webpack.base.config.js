const path = require('path')
const os = require('os')
const fs = require('fs')
const _ = require('lodash')
const glob = require('glob')
const webpack = require('webpack')
const babelMerge = require('babel-merge')
const HappyPack = require('happypack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
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
    let jsBuild = _.get(buildInfo, 'js.build', 'superkaola-build')
    let jsLocal = _.get(buildInfo, 'js.local', 'superkaola-local')
    let cssBuild = _.get(buildInfo, 'css.build', jsBuild)
    let cssLocal = _.get(buildInfo, 'css.local', jsLocal)
    const publicPath = _.get(buildInfo, 'publicPath')

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
    if (fs.statSync(entry).isFile()) {
        return [entry]
    }
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
    const commonBabelConf = buildInfo.babel
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
                    loader: require.resolve('vue-loader'),
                    options: {
                        productionMode: PROD,
                        transformToRequire: {
                            video: 'src',
                            source: 'src',
                            img: 'src',
                            image: 'xlink:href',
                        },
                    },

                },
                {
                    test: /\.js$/,
                    use: `${require.resolve('happypack/loader')}?id=babel`,
                    exclude: file => (
                        !/node_modules\/element-ui\/packages/.test(file) &&
                        !/node_modules\/element-ui\/src/.test(file) &&
                        /node_modules/.test(file) &&
                        !/\.vue\.js/.test(file)
                    ),
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    oneOf: [
                        {
                            resourceQuery: /module/,
                            use: [
                                MiniCssExtractPlugin.loader,
                                {
                                    loader: require.resolve('css-loader'),
                                    options: {
                                        modules: true,
                                        localIdentName: '[local]_[hash:base64:5]',
                                        importLoaders: 1,
                                    },
                                },
                                {
                                    loader: require.resolve('postcss-loader'),
                                    options: buildInfo.postcss,
                                },
                            ],
                        }, {
                            use: [
                                MiniCssExtractPlugin.loader,
                                {
                                    loader: require.resolve('css-loader'),
                                    options: {
                                        importLoaders: 1,
                                    },
                                },
                                {
                                    loader: require.resolve('postcss-loader'),
                                    options: buildInfo.postcss,
                                },
                            ],
                        },
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    loader: require.resolve('url-loader'),
                    options: {
                        limit: 10000,
                    },
                },
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    loader: require.resolve('url-loader'),
                    options: {
                        limit: 10000,
                        name: 'media/[name].[hash:7].[ext]'
                    },
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    loader: require.resolve('url-loader'),
                    options: {
                        limit: 10000,
                        name: 'fonts/[name].[hash:7].[ext]',
                    },
                },
            ],
        },
        plugins: [
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new HappyPack({
                id: 'babel',
                threadPool: happyThreadPool,
                loaders: [{
                    loader: require.resolve('babel-loader'),
                    options: babelMerge(commonBabelConf, proBabelConf),
                }],
            }),
            new VueLoaderPlugin(),
            new MiniCssExtractPlugin({
                filename: PROD ? '[name]_[contenthash].css' : '[name].css',
                chunkFilename: PROD ? '[id]_[contenthash].css' : '[id].css',
            }),
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
    }

    if (buildInfo.needDll) {
        config.plugins.push(new webpack.DllReferencePlugin({
            context: path.join(buildInfo.root, 'node_modules', '.super-kaola'),
            manifest: require(path.join(buildInfo.root, 'node_modules', '.super-kaola', 'base-manifest.json')),
        }))
    }

    return config
}

module.exports = getBaseConfig
