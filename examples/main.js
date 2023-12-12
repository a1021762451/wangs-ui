import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import "./mock";
import './reset.less'
import 'element-ui/lib/theme-chalk/index.css'
import 'nprogress/nprogress.css' // progress bar style
Vue.config.productionTip = false
Vue.use(ElementUI)
import WSUI from '@'
Vue.use(WSUI)
import * as echarts from 'echarts'
Vue.prototype.$echarts = echarts

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
