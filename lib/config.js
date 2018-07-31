module.exports = {
    CONF_FILE_NAME: 'superkaola.json',
    HMR_PATH: '__superkaola_hmr__',
    root: process.cwd(),
    DEV_PORT: '3456',
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
