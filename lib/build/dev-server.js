const webpack = require('webpack')
const express = require('express')
const proxyMiddleware = require('http-proxy-middleware')
const history = require('connect-history-api-fallback')
const cs = require('../console')
const config = require('../config')


function getProxyMiddleware(proxyTarget) {
    return proxyMiddleware(pathname => pathname.match(/^\/web/), {
        target: proxyTarget
    })
}

function startDevServer(webpackConfig, options = {}) {
    const app = express()

    cs.buildLog('Bootstrap dev server...', 'info');
    const compiler = webpack(webpackConfig);

    const devMiddleware = require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: config.stats,
    });

    if (options.proxyTarget) {
        app.use(getProxyMiddleware(options.proxyTarget))
    }

    app.use(history())

    app.use(devMiddleware)

    app.use(require('webpack-hot-middleware')(compiler, {
        path: `/${config.HMR_PATH}`,
    }))

    cs.log('> Starting dev server...');
    devMiddleware.waitUntilValid(() => {
        // cs.buildLog('> 请配置host：127.0.0.1 local-apollo-kl.netease.com');
        cs.buildLog(`> dev服务器： http://localhost:${config.DEV_PORT}/`);
    });

    process.once('SIGINT', () => devMiddleware.close());

    app.listen(config.DEV_PORT, (err) => {
        if (err) {
            return cs.log(err, 'error')
        }
    });
}

module.exports = startDevServer;
