const webpack = require('webpack')
const analyze = require('./analyze')
const cs = require('../console')
const config = require('../config')
const helper = require('../helper')

const buildDLL = (proBuildInfo, statsDir, callback) => {
    // 生成项目指定的webpack配置
    const webpackConfig = helper.getDllWebpackConfig(proBuildInfo)

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
            cs.buildLog(statsDir)
            analyze('dll', stats, statsDir, callback)
        } else {
            cs.buildLog(stats.toString(config.stats))
            callback()
        }
    });
};

module.exports = buildDLL;
