const cs = require('../lib/console');
const helper = require('../lib/helper');
const config = require('../lib/config');
const build = require('./build');

const analyze = (filePath) => {
    filePath = filePath || config.statsDir
    if (typeof filePath !== 'string') {
        cs.log('File path must be String', 'error');
        helper.stop(true);
    }

    let directory;
    let isDirectory;
    try {
        directory = path.resolve(config.root, filePath);
        isDirectory = fs.lstatSync(directory).isDirectory();
    } catch (ex) {
        cs.log('Fail to resolve the file path', 'error');
        helper.stop(true);
    }

    if (!isDirectory) {
        cs.log('File path must point to a directory', 'error');
        helper.stop(true);
    }

    cs.log('Analyzing...');
    build('analyze', directory);
}

module.exports = analyze
