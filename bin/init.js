const chalk = require('chalk')
const yeoman = require('yeoman-environment')


function init() {
    const env = yeoman.createEnv()
    env.register(require.resolve('generator-superkaola'), 'npm:superkaola')
    env.run('npm:superkaola')
}

module.exports = init
