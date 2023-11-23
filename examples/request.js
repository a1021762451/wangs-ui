import axios from 'axios'
import NProgress from 'nprogress'
import { Message } from 'element-ui'
const errorCode = {
  '000': '操作太频繁，请勿重复请求',
  401: '授权已过期，请重新登录',
  403: '当前操作没有权限',
  404: '资源不存在',
  417: '未绑定登录账号，请使用密码登录后绑定',
  423: '演示环境不能操作',
  426: '用户名不存在或密码错误',
  428: '验证码错误,请重新输入',
  429: '请求过频繁',
  479: '演示环境，没有权限操作',
  default: '系统未知错误,请反馈给管理员',
}

axios.defaults.validateStatus = function (status) {
  return status >= 200 && status <= 500 // 默认的
}
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  // baseURL: window.__gconf.AppServerAddress,
  // 超时
  timeout: 30000,
})

NProgress.configure({
  showSpinner: false,
})
// request拦截器
service.interceptors.request.use(
  (config) => {
    NProgress.start()
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    NProgress.done()
    const status = Number(res.status) || 200
    const message =
      res.data.message ||
      errorCode[status] ||
      res.data.msg ||
      errorCode['default']
    if (status !== 200 || res.data.code === 1) {
      //|| res.data.code === 1
      Message({
        message: message,
        type: 'error',
      })
      return Promise.reject(new Error(message))
    }
    return res.data
  },
  (error) => {
    NProgress.done()
    let { msg } = error
    if (msg == 'Network Error') {
      msg = '后端接口连接异常'
    } else if (msg.includes('timeout')) {
      msg = '系统接口请求超时'
    } else if (msg.includes('Request failed with status code')) {
      msg = '系统接口' + msg.substr(msg.length - 3) + '异常'
    }
    Message({
      message: msg,
      type: 'error',
      duration: 5 * 1000,
    })
    return Promise.reject(new Error(error))
  }
)

export default service
