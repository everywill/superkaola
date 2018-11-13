const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const chokidar = require('chokidar')
const cs = require('../console')
const conf = require('../config')
const helper = require('../helper')
const checkProConf = require('./check-project-config')

let clientConfig

const readFile = (givenFs, file) => {
    try {
        return givenFs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
    } catch (e) {}
}

function setupDevServer(app, cb) {
    let bundle
    let template
    let clientManifest

    // assign environment variables
    process.env.SUPERKAOLA_ENV = 'development'
    process.env.SUPERKAOLA_ROOT = path.resolve(__dirname, '../..')

    // reassign client webpack config
    const proBuildInfo = helper.findConfig(
        path.resolve(conf.root, `./${conf.CONF_FILE_NAME}`),
        'build',
    )
    if (!checkProConf(proBuildInfo)) helper.stop(true);
    clientConfig = helper.getBusinessWebpackConfig(proBuildInfo)

    let ready
    const readyPromise = new Promise((resolve) => { ready = resolve })
    const update = () => {
        if (bundle && clientManifest) {
            ready()
            cb(bundle, {
                template,
                clientManifest,
            })
        }
    }

    // read template from disk and watch
    template = fs.readFileSync(templatePath, 'utf-8')
    chokidar.watch(templatePath).on('change', () => {
        template = fs.readFileSync(templatePath, 'utf-8')
        cs.buildLog('index.html template updated')
        update()
    })

    // dev middleware
    const clientCompiler = webpack(clientConfig)
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
        publicPath: clientConfig.output.publicPath,
        stats: conf.stats,
    })
    app.use(devMiddleware)
    clientCompiler.plugin('done', stats => {
        stats = stats.toJson()
    })

    return readyPromise
}
