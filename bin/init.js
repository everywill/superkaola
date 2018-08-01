const yeoman = require('yeoman-environment')
const cs = require('../lib/console')

function init() {
    cs.log('Configuring superkaola ...', 'info')
    const env = yeoman.createEnv()
    env.lookup(() => {
        env.run('superkaola');
    });
}

module.exports = init
