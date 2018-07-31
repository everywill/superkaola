#!/usr/bin/env node

const program = require('commander')
const pkg = require('./package.json')
const init = require('./bin/init')
const build = require('./bin/build')
const upgrade = require('./bin/upgrade')

const buildAction = type => () => {
    build(type)
}

program
    .version(pkg.version, '-v, --version')

// 初始化配置文件

program
    .command('init')
    .description('初始化配置')
    .action(init)

program
    .command('dev')
    .description('开发环境打包')
    .action(buildAction('dev'))
program
    .command('prd')
    .description('生产环境打包')
    .action(buildAction('prd'))

program
    .command('upgrade')
    .description('升级 superman 配置文件')
    .action(upgrade)

program.parse(process.argv)
