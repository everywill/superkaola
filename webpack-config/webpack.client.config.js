const path = require('path')

const webpackConfigName = process.env.SUPERKAOLA_ENV === 'production' ? 'webpack.prd.config' : 'webpack.dev.config'

const getEnvWebpackConfig = buildInfo => require(path.join(process.env.SUPERKAOLA_ROOT, `webpack-config/${webpackConfigName}`))(buildInfo)

module.exports = getEnvWebpackConfig
