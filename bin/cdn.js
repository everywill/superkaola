const { spawn } = require('child_process');
const chalk = require('chalk');

function cdn() {
    const params = process.argv.slice(3);

    const cmd = spawn('superkaola-cdn', params, {
        stdio: 'inherit',
    });

    cmd.on('error', (err) => {
        if (err.toString().indexOf('superkaola-cdn') > -1) {
            console.log(chalk.yellow('请先全局安装 cdn 依赖包: npm install -g @kaola/superkaola-cdn'));
        }
    });
}

module.exports = cdn;
