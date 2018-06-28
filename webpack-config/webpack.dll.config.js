const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const PROD = process.env.NODE_ENV === 'production';

function resolve(file) {
    return path.join(__dirname, '../../..', file);
}

module.exports = {
    mode: 'production',
    entry: {
        base: [
            'vue',
            'vue-router',
            'echarts',
            'v-charts',
            'qs',
            'axios',
            'element-ui',
            'element-ui/lib/theme-chalk/index.css',
            resolve('src/common/style/index.css')
        ]
    },
    module: {
        rules: [
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
                    limit: 50000
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            '@': resolve('src')
        }
    },
    output: {
        path: PROD ? resolve('../server/app/public') : resolve('local'),
        filename: PROD ? '[name]_[chunkhash].dll.js' : '[name].dll.js',
        library: PROD ? '[name]_[chunkhash]' : '[name]'
    },
    plugins: [
        new webpack.DllPlugin({
            context: path.join(resolve('node_modules'), '.super-kaola'),
            path: path.join(resolve('node_modules'), '.super-kaola', '[name]-manifest.json'),
            name: PROD ? '[name]_[chunkhash]' : '[name]'
        }),
        new MiniCssExtractPlugin({
            filename: PROD ? '[name]_[contenthash].dll.css' : '[name].dll.css',
            chunkFilename: PROD ? '[id]_[contenthash].dll.css' : '[id].dll.css'
        })
    ]
};
