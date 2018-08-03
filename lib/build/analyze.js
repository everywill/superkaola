const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

const analyzer = require.resolve('webpack-bundle-analyzer/lib/bin/analyzer')

const conf = require('../config')
const cs = require('../console')
const helper = require('../helper')

function analyzeModule(destPath) {
    return new Promise((resolve) => {
        const alProcess = spawn('node', [analyzer, destPath]);

        alProcess.on('close', () => {
            resolve()
        })
    })
}

function analyze(type, stats, statsDir, callback) {
    const projectConf = helper.findConfig(path.resolve(conf.root, `./${conf.CONF_FILE_NAME}`), 'project')

    const destPath = `${statsDir}/${projectConf.name}_${type === 'business' ? 'business' : 'dll'}.json`
    cs.log(`${type === 'business' ? 'business' : 'dll'} modules stat file: ${destPath}`, 'info')
    fs.writeFileSync(destPath, JSON.stringify(stats.toJson(conf.stats), null, 4))

    analyzeModule(destPath).then(() => callback && callback());
}

module.exports = analyze
