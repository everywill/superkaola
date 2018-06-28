const buildDLL = require('../lib/build/build-dll');
const buildBusiness = require('../lib/build/build-business');
const check = require('../lib/check');
const cs = require('../lib/console');

cs.buildLog(`开始打包：${process.env.NODE_ENV === 'production' ? '发布' : '开发'}模式`, 'info');

const envMap = {
    dev: 'development',
    prd: 'production'
}

const build = (type, options) => {
    type = type || 'dev'
    process.SUPERKAOLA_ENV = envMap[type]
    process.SUPERMAN_ROOT = path.resolve(__dirname, '..');
    const dllPromise = new Promise((resolve) => {
        if (process.env.npm_config_rebuild_dll) {
            buildDLL(() => {
                resolve(true);
            });
        } else {
            resolve(false);
        }
    });

    dllPromise.then(() => {
        buildBusiness();
    });
};

build();
