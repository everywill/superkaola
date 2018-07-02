const exec = require('child_process').exec
const cs = require('./console')
const conf = require('../lib/config')

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
            console.log(chalk.cyan(`${pathStr}does not exist`))
            this.stop(true)
        }

        if (!stats.isFile()) {
            console.log(chalk.cyan(`${pathStr}does not exist`))
            this.stop(true)
        }

        try {
            confObj = JSON.parse(fs.readFileSync(pathStr))
        } catch (ex) {
            console.log(chalk.red('superkaola.json does not have a valid json content'))
            this.stop(true)
        }

        if (!confObj) {
            console.log(chalk.red('superkaola.json has no content'))
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
    }
}
