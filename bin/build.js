function build(type, options = {}) {
  type = type || 'dev'
  // 设置环境变量
  process.SUPERKAOLA_ENV = type
  process.SUPERKAOLA_ROOT = path.resolve(__dirname, '..')
}

module.exports = build