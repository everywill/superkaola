const exec = require('./helper').exec;
const cs = require('./console');
const pkg = require('../package.json');

module.exports = () => {
  exec('npm show superkaola version')
    .then((version) => {
      const latestVersion = version.replace(/(\n)/, '');
      const currentVersion = pkg.version;

      if (currentVersion < latestVersion) {
        cs.log(`你使用的 Superman 版本已经落后啦。最新的版本为 ${latestVersion}，而当前为${currentVersion}`, 'info');
      }
    })
    .catch((err) => {
      cs.log(err, 'warn');
    });
};
