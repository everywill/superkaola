const chalk = require('chalk');

Object.defineProperty(global, '__stack', {
    get(...args) {
        const orig = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const err = new Error();
        Error.captureStackTrace(err, args.callee);
        const stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get() {
        return `【${__stack[4].getFileName()} ${__stack[4].getLineNumber()}】`; // eslint-disable-line no-undef
    }
});

/**
 * @param {String} info 要展示的信息
 * @param {String} type 信息类型[success, error, warn, info]
 */
const cs = {
    trace: (info, type) => {
        if (!info) {
            return;
        }
        type = type || 'success';

        let ctype;
        switch (type) {
            case 'error':
                ctype = 'red';
                break;
            case 'warn':
                ctype = 'yellow';
                break;
            case 'info':
                ctype = 'cyan';
                break;
            case 'succ':
                ctype = 'green';
                break;
            default:
                ctype = 'white';
                break;
        }

        if (typeof info === 'object') {
            console.log(info);
        } else {
            console.log(chalk[ctype](info));
        }
    },

    log: (info, type) => {
        cs.trace(info, type);
    },

    buildLog: (info, type) => {
        cs.log(info, type);
    }
};

module.exports = cs;
