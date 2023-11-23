/*
 * @Author: wanns 1021762451@qq.com
 * @Date: 2023-03-15 19:36:28
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-11-17 15:02:52
 * @FilePath: \ws-ui\packages\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const components = []
// 获取所有组件的模块 ID 列表
const context = require.context('./', true, /\index.js$/)
const componentKeys = context.keys()
componentKeys.shift()
// 遍历组件列表， 获取所有组件配置components
componentKeys.forEach((componentKey) => {
  // 根据模块 ID 获取组件的配置对象
  const componentConfig = context(componentKey)
  components.push(componentConfig.default || componentConfig)
})
// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install = function (Vue, opts) {
  // 判断是否安装
  if (install.installed) return
  // 遍历注册全局组件
  components.forEach((component) => Vue.use(component.install))
}
// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  // 以下是单个导出的组件
  ...components,
}
