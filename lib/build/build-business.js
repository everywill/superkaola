const webpack = require('webpack')
const path = require('path')
const clean = require('./clean')
const startDevServer = require('./dev-server')
const analyze = require('./analyze')
const config = require('../config')
const helper = require('../helper')
const cs = require('../console')

const buildBusiness = (proBuildInfo, needDll, statsDir, options = {}) => {
    const webpackConfig = helper.getBusinessWebpackConfig(proBuildInfo, needDll)

    cs.buildLog('Building bussiness modules, files：')
    cs.buildLog(webpackConfig.entry)

    if (process.env.SUPERKAOLA_ENV === 'production') {
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                cs.buildLog(err, 'error')
            }
            if (stats.hasErrors()) {
                cs.buildLog(stats.toString(), 'error')
                helper.stop(true)
            }

            if (statsDir) {
                analyze('business', stats, statsDir)
            } else {
                cs.buildLog(stats.toString(config.stats))
            }

            clean(webpackConfig)
        });
    } else {
        let proxyTarget = options.proxy
        if (proxyTarget && !/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):?([0-9]{1,5})?/.test(proxyTarget)) {
            const proxyTable = require(path.join(proBuildInfo.root, proBuildInfo.build.extra.proxyTable))
            proxyTarget = proxyTable[proxyTarget]
        }
        startDevServer(webpackConfig, {
            proxyTarget,
        })
    }
};

module.exports = buildBusiness;
