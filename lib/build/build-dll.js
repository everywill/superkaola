const webpack = require('webpack');
const cs = require('../console');

const buildDLL = (callback) => {
    cs.buildLog('打包DLL通用模块，打包文件：');
    const webpackConfig = require('../../webpack-config/webpack.dll.config');
    cs.buildLog(webpackConfig.entry);

    webpack(webpackConfig, (err, stats) => {
        if (stats.hasErrors()) {
            cs.buildLog(stats.toString(), 'error');

            cs.log('super-kaola进程终止', 'error');
            process.exit(1);
        }
        cs.buildLog(stats.toString({
            colors: true,
            chunks: false,
            version: false,
            children: false,
            modules: false
        }));
        callback();
    });
};

module.exports = buildDLL;
