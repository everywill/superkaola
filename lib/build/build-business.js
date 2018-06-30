const webpack = require('webpack')
const cs = require('../console')
const clean = require('./clean')
const config = require('../config')
const startDevServer = require('./dev-server')

const buildBusiness = () => {
    const webpackConfigName = process.env.SUPERKAOLA_ENV === 'production' ? 'webpack.prod.config' : 'webpack.dev.config';
    const webpackConfig = require(`../../webpack-config/${webpackConfigName}`);

    cs.buildLog('打包业务逻辑，打包文件：');
    cs.buildLog(webpackConfig.entry);

    if (process.env.SUPERKAOLA_ENV === 'production') {
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                cs.buildLog(err, 'error');
            }
            if (stats.hasErrors()) {
                cs.buildLog(stats.toString(), 'error');

                cs.log('super-kaola进程终止', 'error');
                process.exit(1);
            }

            cs.buildLog(stats.toString(config.stats));

            clean(webpackConfig);
        });
    } else {
        startDevServer();
    }
};

module.exports = buildBusiness;
