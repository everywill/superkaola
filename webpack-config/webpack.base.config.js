const path = require('path');
const webpack = require('webpack');
const os = require('os');
const HappyPack = require('happypack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const PROD = process.env.NODE_ENV === 'production';

const happyThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length
});

function resolve(file) {
    return path.join(__dirname, '../../..', file);
}

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    // devtool: false,
    entry: {
        app: resolve('src/app/main.js')
    },
    output: {
        publicPath: PROD ? '/public/' : '/',
        path: PROD ? resolve('../server/app/public') : resolve('local'),
        filename: PROD ? '[name]_[chunkhash].js' : '[name].js',
        chunkFilename: PROD ? '[name]_[chunkhash].js' : '[name].js'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
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
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(woff2?|eot|ttf|otf|png|svg)(\?.*)?$/,
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
};
