const express = require('express')
const webpack = require('webpack')
const proxyMiddleware = require('http-proxy-middleware')
const history = require('connect-history-api-fallback')
const cs = require('../console')
const config = require('../config')

const app = express()
/**
 * 开启dev server 支持hotload
 */
function startDevServer() {
    cs.buildLog('启动dev服务器', 'info');
    const webpackConfig = require('../../webpack-config/webpack.dev.config');
    const compiler = webpack(webpackConfig);

    const devMiddleware = require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: config.stats
    });

    app.use(history())

    app.use(devMiddleware)

    app.use(require('webpack-hot-middleware')(compiler, {
        path: `/${config.HMR_PATH}`
    }))
    /*
    const proxyEnv = process.argv[2];
    const proxyTarget = proxyTable[proxyEnv];
    const proxyPrefix = ['/api'];
    if (proxyTarget) {
        app.use(proxyMiddleware(proxyPrefix, {
            target: proxyTable[proxyEnv]
        }));
    }
    */
    console.log('> Starting dev server...');
    devMiddleware.waitUntilValid(() => {
        // cs.buildLog('> 请配置host：127.0.0.1 local-apollo-kl.netease.com');
        cs.buildLog('> dev服务器： http://local-apollo-kl.netease.com:3456/');
    });

    process.once('SIGINT', () => devMiddleware.close());

    app.listen(3456, (err) => {
        if (err) {
            return console.error(err);
        }
    });
}

module.exports = startDevServer;
