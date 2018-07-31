const fs = require('fs');
const _ = require('lodash');
const rimraf = require('rimraf');
const glob = require('glob');

/**
 * 自动清理同名文件
 */
function cleanUpSameNameFile({ cssBuildPath, jsBuildPath }) {
    let fileNamePattern;

    const PROD = process.env.NODE_ENV === 'production';

    if (PROD) {
        fileNamePattern = /(.*)(_\w*?)(\.\w*)*$/;
    } else {
        fileNamePattern = /(.*)\.\w*$/;
    }

    function cleanVictim(files) {
        // 组合根据文件字典和修改时间排序
        let tmp1;
        let tmp2;
        files.sort((a, b) => {
            tmp1 = a.match(fileNamePattern)[1];
            tmp2 = b.match(fileNamePattern)[1];

            if (tmp1 > tmp2) {
                return 1;
            } else if (tmp1 === tmp2) {
                if (fs.statSync(a).mtime < fs.statSync(b).mtime) {
                    return 1;
                }
                return -1;
            }
            return -1;
        });

        const surviveArr = [];
        files.forEach((item) => {
            if (surviveArr.length === 0 ||
                surviveArr[surviveArr.length - 1].match(fileNamePattern)[1] !== item.match(fileNamePattern)[1]
            ) {
                surviveArr.push(item);
            }
        });

        _.difference(files, surviveArr).forEach((item) => {
            rimraf.sync(item);
        });
    }


    // 删除多余的js，这些都是css的入口
    glob(`${jsBuildPath}/*.js`, (err, files) => {
        cleanVictim(files);
    });

    glob(`${cssBuildPath}/*.css`, (err, files) => {
        cleanVictim(files);
    });
}

/**
 * 自动清理文件
 * @param {Object} proConf 项目配置
 */
function clean(webpackConfig) {
    const jsBuildPath = _.get(webpackConfig, 'output.path', '');
    const cssBuildPath = _.get(webpackConfig, 'output.path', '');

    // cleanUpCSS({ cssBuildPath, jsBuildPath });
    cleanUpSameNameFile({ cssBuildPath, jsBuildPath });
}


module.exports = clean;
