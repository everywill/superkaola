const webpack = require('webpack')
const path = require('path')
const cs = require('../console')
const config = require('../config')

const getDllWebpackConfig = (proBuildInfo) => {
    const commonDllWebpackConfig = require(path.join(process.env.SUPERKAOLA_ROOT, 'webpack-config/webpack.dll.config'))(Object.assign({}, proBuildInfo, {
        root: config.root,
        dllModules: proBuildInfo.dllModules
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
    const proWebpackConfWithoutEntry = Object,assign({}, proWebpackConf, { entry: {} }))
    const wbpConf = merge(proWebpackConfWithoutEntry, commonDllWebpackConfig)

    return wbpConf
}

const buildDLL = (proBuildInfo, statsDir, callback) => {
    // 生成项目webpack配置
    const webpackConfig = getDllWebpackConfig(proBuildInfo)

    // 开始打包
    cs.buildLog('Building Dll modules，files：')
    cs.buildLog(webpackConfig.entry)

    webpack(webpackConfig, (err, stats) => {
        if (stats.hasErrors()) {
            cs.buildLog(stats.toString(), 'error')

            cs.log('super-kaola aborted', 'error')
            process.exit(1)
        }
        cs.buildLog(stats.toString(config.stats));
        callback()
    });
};

module.exports = buildDLL;
