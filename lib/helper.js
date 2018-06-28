const ch = require('child_process')
const exec = ch.exec

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
        let confObj;
        let stats;

        if (pathStr.indexOf('/') !== 0) {
            pathStr = `${config.root}/${pathStr}`;
        }

        try {
            stats = fs.statSync(pathStr);
        } catch (ex) {
            console.log(chalk.cyan(`${pathStr}不存在`));
            this.stop(true);
        }

        if (!stats.isFile()) {
            console.log(chalk.cyan(`${pathStr}不存在`));
            this.stop(true);
        }

        try {
            confObj = JSON.parse(fs.readFileSync(pathStr));
        } catch (ex) {
            console.log(chalk.red('配置文件格式不是正确的json'));
            this.stop(true);
        }

        if (!confObj) {
            console.log(chalk.red('没有对应的配置信息'));
            this.stop(true);
        }

        if (!name) {
            return confObj;
        }
        return confObj[name];
    },
}
