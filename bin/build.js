const path = require('path')
const buildDLL = require('../lib/build/build-dll')
const buildBusiness = require('../lib/build/build-business')
const checkProConf = require('../lib/build/check-project-config')
const cs = require('../lib/console')
const conf = require('../lib/config')
const helper = require('../lib/helper')

const envMap = {
    dev: 'development',
    prd: 'production',
    analyze: 'production',
}

const build = (type, statsDir, options) => {
    type = type || 'dev' // eslint-disable-line

    process.env.SUPERKAOLA_ENV = envMap[type]
    process.env.SUPERKAOLA_ROOT = path.resolve(__dirname, '..')

    const proBuildInfo = helper.findConfig(
        path.resolve(conf.root, `./${conf.CONF_FILE_NAME}`),
        'build',
    )

    if (!checkProConf(proBuildInfo)) helper.stop(true);

    cs.buildLog(`Building：${process.env.SUPERKAOLA_ENV} mode`, 'info');

    const dllPromise = new Promise((resolve) => {
        if (proBuildInfo.dllModules) {
            buildDLL(proBuildInfo, statsDir, () => {
                resolve(true);
            });
        } else {
            resolve(false);
        }
    })

    dllPromise.then((needDll) => {
        buildBusiness(proBuildInfo, needDll, statsDir, options);
    })
}

module.exports = build
