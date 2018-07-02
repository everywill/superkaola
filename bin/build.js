const buildDLL = require('../lib/build/build-dll');
const buildBusiness = require('../lib/build/build-business');
const checkProConf = require('../lib/build/check-project-config');
const cs = require('../lib/console');
const conf = require('../lib/config');

const envMap = {
    dev: 'development',
    prd: 'production',
    analyze: 'production'
}

const build = (type, statsDir) => {
    type = type || 'dev'

    process.env.SUPERKAOLA_ENV = envMap[type]
    process.env.SUPERKAOLA_ROOT = path.resolve(__dirname, '..')

    let proBuildInfo = helper.findConfig(
        path.resolve(conf.root, `./${conf.CONF_FILE_NAME}`),
        'build'
    )

    if (!checkProConf(proBuildInfo)) helper.stop(true);

    cs.buildLog(`Building：${process.env.SUPERKAOLA_ENV} mode`, 'info');

    const dllPromise = new Promise((resolve) => {
        if (process.env.npm_config_rebuild_dll) {
            buildDLL(proBuildInfo, statsDir, () => {
                resolve(true);
            });
        } else {
            resolve(false);
        }
    })

    dllPromise.then((needDll) => {
        buildBusiness(proBuildInfo, needDll, statsDir);
    })
}

module.exports = build
