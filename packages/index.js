import wsForm from './ws-form'
import wsTable from './ws-table'
import wsTree from './ws-tree'
import wsEchatrs from './ws-echarts'
import wsCheckbox from './ws-checkbox'
import wsTooltip from './ws-tooltip'

// 存储组件列表
const components = [wsForm, wsTable, wsTree, wsEchatrs, wsCheckbox, wsTooltip]
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

export {
  // 以下是单个导出的组件
  wsForm,
  wsTable,
  wsTree,
  wsEchatrs,
  wsCheckbox,
  wsTooltip
}

export default install
