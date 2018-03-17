#!/usr/bin/env node

const program = require('commander')

const pkg = require('./package.json')

const init = require('./bin/init')
const build = require('./bin/build')

const entryDest = command => {
  return `指定的模块, entry 的路径为 superkaola 执行目录的相对路径. 示例: superkaola ${command} --entry src/hello`;
};

const buildAction = type => {
  return options => {
    build(type, undefined, options)
  }
}

program
.version(pkg.version)

// 初始化配置文件
program
.command('init [name]')
.description('初始化配置')
.action(init)

program
.command('dev')
.description('开发环境打包')
.option('-e, --entry [entry]', `开发打包${entryDest('dev')}`)
.action(buildAction('dev'));

program
.command('prd')
.description('生产环境打包')
.option('-e, --entry [entry]', `生产环境打包${entryDest('prd')}`)
.action(buildAction('prd'));

program.parse(process.argv)
