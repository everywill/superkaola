const spawn = require('child_process').spawn
const chalk = require('chalk')

function init() {
  spawn('yo', ['superkaola'], {
    stdio: 'inherit'
  })

  process.on('uncaughtException', () => {
    console.log(chalk.magenta('请先安装yeoman: '));
    console.log(chalk.bgWhite.magenta('npm install -g yo'));
  })
}

module.exports = init
