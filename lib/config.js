const path = require('path')

module.exports = {
    CONF_FILE_NAME: 'superkaola.json',
    HMR_PATH: '__superkaola_hmr__',
    DEV_PORT: '3456',
    root: process.cwd(),
    statsDir: path.join(process.cwd(), 'node_modules', '.super-kaola'),
    stats: {
        colors: true,
        chunks: false,
        version: false,
        children: false,
        modules: false,
    },
    babel: {
        presets: [['env', {
            modules: false,
            targets: {
                browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
            },
        }], 'stage-2'],
        plugins: ['transform-runtime', 'transform-vue-jsx'],
    },
}
