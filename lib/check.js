const exec = require('./helper').exec;
const cs = require('./console');
const pkg = require('../package.json');

module.exports = () => {
  exec('npm show superkaola version')
    .then((version) => {
      const latestVersion = version.replace(/(\n)/, '');
      const currentVersion = pkg.version;

      if (currentVersion < latestVersion) {
        cs.log(`Superman is outdated, this latest version is ${latestVersion}, current version is ${currentVersion}`, 'info');
      }
    })
    .catch((err) => {
      cs.log(err, 'warn');
    });
};
