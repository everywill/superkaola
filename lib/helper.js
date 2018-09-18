const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const merge = require('webpack-merge')
const cs = require('./console')
const config = require('./config')

module.exports = {
    exec(cmd) {
        return new Promise((resolve, reject) => {
            exec(cmd, (err, stdout) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(stdout)
                }
            })
        })
    },
    findConfig(pathStr, name) {
        let confObj
        let stats

        if (pathStr.indexOf('/') !== 0) {
            pathStr = `${config.root}/${pathStr}`
        }

        try {
            stats = fs.statSync(pathStr)
        } catch (ex) {
            cs.log(chalk.cyan(`${pathStr} does not exist`))
            this.stop(true)
        }

        if (!stats.isFile()) {
            cs.log(chalk.cyan(`${pathStr} does not exist`))
            this.stop(true)
        }

        try {
            confObj = JSON.parse(fs.readFileSync(pathStr))
        } catch (ex) {
            cs.log(chalk.red('superkaola.json does not have a valid json content'))
            this.stop(true)
        }

        if (!confObj) {
            cs.log(chalk.red('superkaola.json has no content'))
            this.stop(true)
        }

        if (!name) {
            return confObj
        }
        return confObj[name]
    },
    stop(isForce = false, code = 1) {
        if (isForce) {
            cs.log(`Superkaola aborted, code: ${code}`, 'error')
            process.exit(code)
        }

        if (process.SUPERMAN_ENV === 'production') {
            cs.log(`Superkaola aborted, code: ${code}`, 'error')
            process.exit(code)
        }
    },
    getBusinessWebpackConfig(proBuildInfo, needDll) {
        let proWebpackConf
        const commonBusinessWebpackConfig = require(path.join(process.env.SUPERKAOLA_ROOT, 'webpack-config/webpack.client.config'))(Object.assign({}, proBuildInfo, {
            root: config.root,
            babel: config.babel,
            postcss: config.postcss,
            needDll,
        }))

        if (proBuildInfo.extra && proBuildInfo.extra.webpackConfigPath) {
            try {
                proWebpackConf = require(path.resolve(config.root, proBuildInfo.extra.webpackConfig))
            } catch (ex) {
                cs.log(ex, 'error')
            }
        }

        const wbpConf = merge(proWebpackConf, commonBusinessWebpackConfig)

        return wbpConf
    },
    getDllWebpackConfig(proBuildInfo) {
        let proWebpackConf

        const commonDllWebpackConfig = require(path.join(process.env.SUPERKAOLA_ROOT, 'webpack-config/webpack.dll.config'))(Object.assign({}, proBuildInfo, {
            root: config.root,
            babel: config.babel,
            postcss: config.postcss,
        }))

        // 项目配置优先于通用配置
        if (proBuildInfo.extra && proBuildInfo.extra.webpackConfigPath) {
            try {
                proWebpackConf = require(path.resolve(config.root, proBuildInfo.extra.webpackConfig))
            } catch (ex) {
                cs.log(ex, 'error')
            }
        }

        // dll打包不使用项目entry
        const proWebpackConfWithoutEntry = Object.assign({}, proWebpackConf, { entry: {} })
        const wbpConf = merge(proWebpackConfWithoutEntry, commonDllWebpackConfig)

        return wbpConf
    },
}
