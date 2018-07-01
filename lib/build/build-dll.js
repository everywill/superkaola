const webpack = require('webpack')
const path = require('path')
const cs = require('../console')
const config = require('../config')


const buildDLL = (proBuildInfo, callback) => {
    cs.buildLog('打包DLL通用模块，打包文件：');
    const webpackConfig = require(path.join(process.env.SUPERKAOLA_ROOT, 'webpack-config/webpack.dll.config'))
    cs.buildLog(webpackConfig.entry)

    webpack(webpackConfig, (err, stats) => {
        if (stats.hasErrors()) {
            cs.buildLog(stats.toString(), 'error')

            cs.log('super-kaola进程终止', 'error')
            process.exit(1);
        }
        cs.buildLog(stats.toString(config.stats));
        callback();
    });
};

module.exports = buildDLL;
