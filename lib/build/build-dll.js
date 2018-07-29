const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const cs = require('../console')
const config = require('../config')
const helper = require('../helper')
const analyze = require('./analyze')

const getDllWebpackConfig = (proBuildInfo) => {
    const commonDllWebpackConfig = require(path.join(process.env.SUPERKAOLA_ROOT, 'webpack-config/webpack.dll.config'))(Object.assign({}, proBuildInfo, {
        root: config.root
    }))

    // 项目配置优先于通用配置
    if (proBuildInfo.webpackConfigPath) {
        try {
            proWebpackConf = require(path.resolve(config.root, proBuildInfo.webpackConfigPath))
        } catch (ex) {
            cs.log(ex, 'error')
        }
    }

    // dll打包不使用项目entry
    const proWebpackConfWithoutEntry = Object.assign({}, proWebpackConf, { entry: {} }))
    const wbpConf = merge(proWebpackConfWithoutEntry, commonDllWebpackConfig)

    return wbpConf
}

const buildDLL = (proBuildInfo, statsDir, callback) => {
    // 生成项目指定的webpack配置
    const webpackConfig = getDllWebpackConfig(proBuildInfo)

    // 开始打包
    cs.buildLog('Building Dll modules，files：')
    cs.buildLog(webpackConfig.entry)

    webpack(webpackConfig, (err, stats) => {
        if (stats.hasErrors()) {
            cs.buildLog(stats.toString(), 'error')
            cs.log('super-kaola aborted', 'error')

            helper.stop()
        }
        if (statsDir) {
            cs.buildLog(profilePath)
            analyze('dll', stats, statsDir, callback)
        } else {
            cs.buildLog(stats.toString(config.stats))
            callback()
        }
    });
};

module.exports = buildDLL;
