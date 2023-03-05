const { defineConfig } = require('@vue/cli-service')
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      // page 入口
      entry: 'examples/main.js',
      // 模板来源
      template: 'public/index.html',
      // dist/index.html 输出
      filename: 'index.html'
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('packages')
      }
    }
  }
})
