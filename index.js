#!/usr/bin/env node

const program = require('commander')

const init = require('./bin/init')

// 初始化配置文件
program
  .command('init [name]')
  .description('初始化配置，如build')
  .action(init)
