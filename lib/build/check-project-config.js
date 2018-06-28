const _ = require('lodash');
const cs = require('../console');

const check = buildConf => {
  if (!buildConf) {
    cs.log('没有找到关于 build 的相关配置', 'error');
    return false;
  }

  if (!_.get(buildConf, 'js', false) || !_.get(buildConf, 'css', false)) {
    cs.log('没有找到打包入口相关配置', 'warn');
    return false;
  }
  return true;
};

module.exports = check;