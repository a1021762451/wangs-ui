// 全局属性
const globalAttrs = {
  clearable: true,
}

// 组件和通用的属性映射
const commonAttrs = {
  'el-select': {
    default: {
      filterable: true,
      placeholder: '请选择',
    },
  },
  'el-input': {
    default: {
      placeholder: '请输入',
    },
    textarea: {
      'show-word-limit': true,
      maxlength: 1000,
      placeholder: '请输入',
      rows: 2,
    },
  },
  'el-input-number': {
    default: {
      controls: false,
      placeholder: '请输入数字',
      min: 1,
      max: 100,
      step: 1,
      precision: 0,
    },
  },
  'el-date-picker': {
    default: {
      placeholder: '选择时间',
      clearable: false,
    },
  },
  'el-time-picker': {
    default: {
      placeholder: '选择时间',
    },
  },
  'el-time-select': {
    default: {
      placeholder: '选择时间',
    },
  },
  'el-checkbox': {
    default: {
      'true-label': '1',
      'false-label': '0',
    },
  },
}

// 获取所有的配置属性
export function getAttrs(fieldItem, formData = {}, isDetail) {
  let obj = {}
  if (
    fieldItem.component === 'el-date-picker' ||
    fieldItem.component === 'el-time-select' ||
    fieldItem.component === 'el-time-picker'
  ) {
    obj['picker-options'] = getPicker(fieldItem, formData)
  }
  if (fieldItem.component === 'el-date-picker') {
    obj['popper-class'] = fieldItem.timeDisabled ? 'hideCurrent' : ''
  }
  const allTypes = commonAttrs[fieldItem.component] || {}
  const componentAttrs = fieldItem.componentAttrs || {}
  const type = componentAttrs.type
  obj = {
    ...obj,
    ...globalAttrs,
    ...(allTypes[type] || allTypes.default || {}),
    disabled: isDetail,
    ...componentAttrs,
  }
  obj.placeholder = obj.disabled ? '' : obj.placeholder
  return obj
}

// 时间框时间选择进行限制
export function getPicker(fieldItem, formData) {
  // 初始化参数
  let {
    component,
    minAllowEqual = true,
    maxAllowEqual = true,
    timeDisabled,
    minDate = 0,
    maxDate = 0,
    minTimeProp,
    maxTimeProp,
  } = fieldItem
  const componentAttrs = fieldItem.componentAttrs || {}
  const { type, isRange, valueFormat, pickerOptions = {} } = componentAttrs
  // 如果是范围选择则 不进行限制
  if (/range/i.test(type) || isRange) return {}
  // 获取最小最大时间值
  let minTime = '00:00:00'
  let maxTime = '23:59:59'
  // minDate, maxDate可能是函数, 从而实现动态限制
  minDate = typeof minDate === 'function' ? minDate() : minDate
  maxDate = typeof maxDate === 'function' ? maxDate() : maxDate
  const minValue = formData[minTimeProp] || minDate || 0
  const maxValue = formData[maxTimeProp] || maxDate || 0
  // el-date-picker组件
  if (component === 'el-date-picker') {
    // 单独处理日月年限制
    let minDateYMD = +new Date(format(new Date(minValue), 'yyyy-MM-dd'))
    let maxDateYMD = +new Date(format(new Date(maxValue), 'yyyy-MM-dd'))
    let selectableRange = ''
    // timeDisabled控制是否禁用精度到时分秒，副作用时此刻按钮隐藏
    if (timeDisabled) {
      if (minValue && formData[fieldItem.prop]) {
        const isSameDay =
          new Date(minValue).toDateString() ===
          new Date(formData[fieldItem.prop]).toDateString()
        if (isSameDay) {
          minTime = format(new Date(minValue), 'HH:mm:ss')
        }
      }
      if (maxValue && formData[fieldItem.prop]) {
        const isSameDay =
          new Date(maxValue).toDateString() ===
          new Date(formData[fieldItem.prop]).toDateString()
        if (isSameDay) {
          maxTime = format(new Date(maxValue), 'HH:mm:ss')
          maxTime = maxTime === '00:00:00' ? '23:59:59' : maxTime
        }
      }
      selectableRange = minTime + '-' + maxTime
    }
    return {
      disabledDate(time) {
        time = +new Date(format(new Date(time), 'yyyy-MM-dd'))
        let minCondition = false
        let maxCondition = false
        minCondition = minAllowEqual ? minDateYMD <= time : minDateYMD < time
        maxCondition = maxAllowEqual ? time <= maxDateYMD : time < maxDateYMD
        if (maxDateYMD) {
          return !(minCondition && maxCondition)
        } else {
          return !minCondition
        }
      },
      selectableRange,
      ...pickerOptions,
    }
    // el-time-select组件
  } else if (component === 'el-time-select') {
    // minTime/start maxTime/end 限制重复，只用一种即可
    minTime = minValue || '00:00'
    maxTime = maxValue || '23:59'
    return {
      start: minTime,
      end: maxTime,
      ...pickerOptions,
      // minTime: minValue,
      // maxTime: maxValue
    }

    // el-time-picker组件
  } else if (component === 'el-time-picker') {
    // 秒级别控制不了
    let selectableRange = ''
    // 处理minTime
    minTime = minValue || '00:00:00'
    minTime =
      typeof minTime === 'string' ? minTime : format(minTime, 'HH:mm:ss')
    const minO = decodeFormatTime(minTime, valueFormat || 'HH:mm:ss')
    minTime = encodeFormatTime(minO, 'HH:mm:ss')
    // 处理maxTime
    maxTime = maxValue || '23:59:59'
    maxTime =
      typeof maxTime === 'string' ? maxTime : format(maxTime, 'HH:mm:ss')
    const maxO = decodeFormatTime(maxTime, valueFormat || 'HH:mm:ss')
    maxTime = encodeFormatTime(maxO, 'HH:mm:ss')
    selectableRange = minTime + '-' + maxTime
    return {
      selectableRange,
      ...pickerOptions,
    }
  }
}
// 获取最大时间校验
export function getMinValidator(fieldItem, min) {
  const { minAllowEqual = true } = fieldItem
  return function (rule, val, callback) {
    let value = val || 0
    let minValue = min || 0
    if (
      fieldItem.component !== 'el-date-picker' &&
      minValue &&
      typeof minValue === 'string'
    ) {
      minValue = `1998-06-12 ${minValue}`
    }
    if (
      fieldItem.component !== 'el-date-picker' &&
      value &&
      typeof value === 'string'
    ) {
      value = `1998-06-12 ${value}`
    }
    let minCondition = minAllowEqual
      ? +new Date(value) < +new Date(minValue)
      : +new Date(value) <= +new Date(minValue)
    // console.log(value, minValue, +new Date(value), +new Date(minValue), minCondition, 'minCondition');
    if (minCondition) {
      callback(new Error('请注意时间先后'))
    } else {
      callback()
    }
  }
}
// 获取最小时间校验
export function getMaxValidator(fieldItem, max) {
  const { maxAllowEqual = true } = fieldItem
  return function (rule, val, callback) {
    let value = val || 0
    let maxValue = max || 0
    if (
      fieldItem.component !== 'el-date-picker' &&
      maxValue &&
      typeof maxValue === 'string'
    ) {
      maxValue = `1998-06-12 ${maxValue}`
    }
    if (
      fieldItem.component !== 'el-date-picker' &&
      value &&
      typeof value === 'string'
    ) {
      value = `1998-06-12 ${value}`
    }
    let maxCondition = maxAllowEqual
      ? +new Date(value) > +new Date(maxValue)
      : +new Date(value) >= +new Date(maxValue)
    maxCondition = maxValue && maxCondition
    // console.log(value, maxValue, +new Date(value), +new Date(maxValue), maxCondition, 'maxCondition');
    if (maxCondition) {
      callback(new Error('请注意时间先后'))
    } else {
      callback()
    }
  }
}
// 获取表格显示的值
export function getShowValue(
  row,
  column,
  $index,
  fieldItem,
  allOptions,
  placeholder
) {
  const { prop, componentAttrs = {}, component } = fieldItem
  let value = row[prop]
  if (value && component === 'el-date-picker' && componentAttrs.format) {
    value && (value = format(new Date(value), componentAttrs.format))
  }
  if (component === 'el-select') {
    const options = allOptions[prop] || []
    const option = options.find((item) => item.value === row[prop])
    option && (value = option.label)
  }
  return fieldItem.formatter
    ? fieldItem.formatter(row, column, value, $index)
    : value || value === 0
    ? value
    : fieldItem.placeholder || placeholder
}
/**
 * 对象深拷贝
 */
export const deepClone = (data) => {
  var type = getObjType(data)
  var obj
  if (type === 'array') {
    obj = []
  } else if (type === 'object') {
    obj = {}
  } else {
    // 不再具有下一层次
    return data
  }
  if (type === 'array') {
    for (var i = 0, len = data.length; i < len; i++) {
      obj.push(deepClone(data[i]))
    }
  } else if (type === 'object') {
    for (var key in data) {
      obj[key] = deepClone(data[key])
    }
  }
  return obj
}
// 获取类型
export const getObjType = (obj) => {
  var toString = Object.prototype.toString
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
  }
  if (obj instanceof Element) {
    return 'element'
  }
  return map[toString.call(obj)]
}

// 防抖
export const debounce = (fn, delay = 500, immediate) => {
  let timer
  return function () {
    let args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    if (immediate) {
      if (!timer) {
        fn.apply(this, args)
        // console.log('防抖立即执行');
      }
      timer = setTimeout(() => {
        timer = null
      }, delay)
    } else {
      timer = setTimeout(() => {
        fn.apply(this, args)
        timer = null
      }, delay)
    }
  }
}
// 节流
export const throttle = (fn, delay = 500, immediate) => {
  let timer
  return function () {
    let args = arguments
    if (timer) {
      // console.log('节流中')
      return
    }
    if (immediate) {
      fn.apply(this, args)
      timer = setTimeout(() => {
        timer = null
      }, delay)
    } else {
      timer = setTimeout(() => {
        timer = null
        fn.apply(this, args)
      }, delay)
    }
  }
}
// 深度合并两个对象
export function deepMerge(obj1, obj2) {
  let key
  for (key in obj2) {
    // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
    // 如果obj2[key]没有值或者值不是对象，此时直接替换obj1[key]
    obj1[key] =
      obj1[key] &&
      obj1[key].toString() === '[object Object]' &&
      obj2[key] &&
      obj2[key].toString() === '[object Object]'
        ? deepMerge(obj1[key], obj2[key])
        : (obj1[key] = obj2[key])
  }
  return obj1
}
// 获取随机id
export function getRandomId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
// 获取随机颜色
export function generateColor() {
  let color = ''
  let r = Math.floor(Math.random() * 256)
  let g = Math.floor(Math.random() * 256)
  let b = Math.floor(Math.random() * 256)
  color = `rgb(${r},${g},${b})`
  return color
}

// 横线命名法转换为驼峰命名法
export function lineToHump(value) {
  return value.replace(/-(\w)/g, function (all, letter) {
    return letter.toUpperCase()
  })
}
// 驼峰命名法转换为横线命名法
export function humpToLine(value) {
  return value.replace(/([A-Z])/g, '-$1').toLowerCase()
}
// 获取对象中的某个属性对应的值，支持驼峰、横线命名
export function getObjAttr(obj, key) {
  if (getObjType(obj) !== 'object' || !key) return ''
  const humpKey = lineToHump(key)
  const lineKey = humpToLine(key)
  // console.log(humpKey, lineKey, 'humpKey, lineKey');
  return obj[humpKey] || obj[lineKey]
}
// 根据时间格式判断时间类型
export function judgeTimeType(limit) {
  const hasYear = limit.includes('yyyy')
  const hasMonth = limit.includes('MM')
  const hasDay = limit.includes('dd')
  const hasHour = limit.includes('HH')
  if (hasMonth && hasDay && hasHour) return 'datetime'
  if (hasMonth && hasDay) return 'date'
  if (hasYear && hasMonth) return 'month'
  if (hasYear) return 'year'
  if (hasHour) return 'time'
}
// 根据时间对象和格式，转换时间
export function format(date, fmt = 'yyyy-MM-dd') {
  var o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'H+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  }
  let match
  if ((match = fmt.match(/(y+)/)))
    fmt = fmt.replace(
      match[1],
      (date.getFullYear() + '').substring(4 - match[1].length)
    )
  for (var k in o)
    if ((match = fmt.match(new RegExp('(' + k + ')'))))
      fmt = fmt.replace(
        match[1],
        match[1].length == 1
          ? o[k]
          : ('00' + o[k]).substring(('' + o[k]).length)
      )
  return fmt
}

// 根据时间和对应的格式，解码成对象
export function decodeFormatTime(date, fmt) {
  var o = {
    'y+': '2000',
    'M+': '01', //月份
    'D+': '01', //日
    'H+': '01', //小时
    'm+': '00', //分
    's+': '00', //秒
    'q+': '01', //季度
    S: '001', //毫秒
  }
  let match
  for (var k in o)
    if ((match = fmt.match(new RegExp('(' + k + ')')))) {
      const index = match.index
      const length = match[1].length
      o[k] = date.substring(index, index + length)
    }
  return o
}

// 根据对象和对应的格式， 转换成对应的格式
export function encodeFormatTime(o, fmt) {
  let match
  if ((match = fmt.match(/(y+)/)))
    fmt = fmt.replace(match[1], (o['y+'] + '').substring(4 - match[1].length))
  for (var k in o)
    if ((match = fmt.match(new RegExp('(' + k + ')'))))
      fmt = fmt.replace(
        match[1],
        match[1].length == 1
          ? o[k]
          : ('00' + o[k]).substring(('' + o[k]).length)
      )
  return fmt
}

const typeFuMap = {
  day: {
    setFn: 'setDate',
    getFn: 'getDate',
  },
  month: {
    setFn: 'setMonth',
    getFn: 'getMonth',
  },
  year: {
    setFn: 'setFullYear',
    getFn: 'getFullYear',
  },
  hour: {
    setFn: 'setHours',
    getFn: 'getHours',
  },
  minute: {
    setFn: 'setMinutes',
    getFn: 'getMinutes',
  },
  second: {
    setFn: 'setSeconds',
    getFn: 'getSeconds',
  },
  millisecond: {
    setFn: 'setMilliseconds',
    getFn: 'getMilliseconds',
  },
}
function handleDate(num, type = 'day', date = new Date(), hasCalculate = true) {
  //计算出要加/减的毫秒数
  const { setFn, getFn } = typeFuMap[type]
  const time = new Date(date)
  const value = hasCalculate ? time[getFn]() + num : num
  time[setFn](value)
  return time
}
// 24小时制时分秒加减
export function handleTime(num, type, time) {
  if (!time) return
  const timeArr = time.split(':')
  let [hour, minute, second] = timeArr.map(Number)
  function judgeHour(hour) {
    return hour < 0 || hour > 23
  }
  function changeMinute() {
    if (minute >= 60) {
      hour += Math.floor(minute / 60)
      minute %= 60
    }
    if (minute < 0) {
      hour += Math.ceil(minute / 60)
      minute = 60 + (minute % 60)
    }
  }
  function changeSecond() {
    if (second >= 60) {
      minute += Math.floor(second / 60)
      second %= 60
      changeMinute()
    }
    if (second < 0) {
      minute += Math.ceil(second / 60)
      second = 60 + (second % 60)
      changeMinute()
    }
  }
  function addZero(value) {
    value = '' + value
    return '00'.replace(new RegExp(`0{${value.length}}$`), value)
  }
  if (type === 'hour') {
    hour = +hour + num
  }
  if (type === 'minute') {
    minute = +minute + num
    changeMinute()
  }
  if (type === 'second') {
    second = +second + num
    changeSecond()
  }
  console.log(hour, minute, second, 'hour, minute, second')
  hour = addZero(hour)
  minute = addZero(minute)
  second = addZero(second)
  const arr = [hour, minute, second]
  return judgeHour(hour) ? time : arr.slice(0, timeArr.length).join(':')
}
// 获取默认时间- 今年的当前时间，明天当前时间，昨天当前时间， 同理去年和明年
export function getDefaultTime(defaultTimeType, formatStr) {
  let time
  const lastYearToday = handleDate(-1, 'year')
  const nextYearToday = handleDate(1, 'year')
  switch (defaultTimeType) {
    case 'today':
      time = new Date()
      break
    case 'yesterday':
      time = handleDate(-1)
      break
    case 'tomorrow':
      time = handleDate(1)
      break
    case 'lastYearToday':
      time = handleDate(-1, 'year')
      break
    case 'lastYearYesterday':
      time = handleDate(-1, 'day', lastYearToday)
      break
    case 'lastYearTomorrow':
      time = handleDate(1, 'day', lastYearToday)
      break
    case 'nextYearToday':
      time = handleDate(1, 'year')
      break
    case 'nextYearYesterday':
      time = handleDate(-1, 'day', nextYearToday)
      break
    case 'nextYearTomorrow':
      time = handleDate(1, 'day', nextYearToday)
      break
    default:
      time = new Date()
      break
  }
  return formatStr ? format(time, formatStr) : time
}

// 树数据扁平化
export function treeToFlat(data = [], props = {}, useDef = true) {
  let { children = 'children', parent = 'pid', id = 'id' } = props
  const result = []
  if (!Array.isArray(data)) return result
  const loop = (data, parentId = null) => {
    data.forEach((item) => {
      if (useDef) {
        if (!item[id]) def(item, id, getRandomId())
        def(item, parent, parentId)
      } else {
        if (!item[id]) item[id] = getRandomId()
        item[parent] = parentId
      }
      result.push(item)
      if (item[children] && item[children].length) {
        loop(item[children], item[id])
      }
    })
  }
  loop(data)
  return result
}
// 扁平数据转树
export function flatToTree(data = [], props = {}) {
  data = deepClone(data)
  let { children = 'children', parent = 'pid', id = 'id' } = props
  const result = []
  const map = {}
  if (!Array.isArray(data)) return result
  data.forEach((item) => {
    map[item[id]] = item
  })
  data.forEach((item) => {
    const parentNode = map[item[parent]]
    // item.disabled = item.isEmployee === '0'
    if (parentNode) {
      if (!parentNode[children]) {
        parentNode[children] = []
      }
      parentNode[children].push(item)
    } else {
      result.push(item)
    }
  })
  return result
}
// 判断是否隐藏
function judgeHidden(el) {
  while (el) {
    const { display, visibility, opacity } = window.getComputedStyle(el)
    if (
      display === 'none' ||
      visibility === 'hidden' ||
      parseFloat(opacity) === 0
    ) {
      return true
    }
    el = el.parentElement
  }
  return false
}
// 创建不可枚举的属性
export function def(obj, key, value, config) {
  Object.defineProperty(obj, key, {
    value,
    enumerable: false,
    ...config,
  })
}
// vue指令，监听元素大小变化(重点是宽度变化)
export const vResize = {
  bind(el, binding) {
    const { window: isWindow, immediate = false } = binding.modifiers
    const valueFn = function () {
      binding.value(...arguments)
    }
    let callback = function () {
      const __resizeTime__ = el.__resizeTime__ || 0
      // 记录resize的次数
      el.__resizeTime__ = __resizeTime__ + 1
      // 次数为0，判断立即执行还是直接退出
      if (!__resizeTime__) {
        immediate && valueFn(...arguments)
        return
      }
      !judgeHidden(el) && valueFn(...arguments)
    }
    callback = debounce(callback, 100)
    // 如果是设置window修饰符，添加resize事件监听
    if (isWindow) {
      callback()
      window.addEventListener('resize', callback)
      el.__bindingValue__ = binding.value
      return
    }
    // 如果支持ResizeObserver
    if (ResizeObserver) {
      // 创建一个ResizeObserver实例并传入一个回调函数
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          // 在这个例子中，我们只关注宽度变化
          const { width, height } = entry.contentRect || {}
          callback({ width, height })
        }
      })
      // 开始观察
      resizeObserver.observe(el)
      el.__resizeObserver__ = resizeObserver
      return
    }
    // 如果不支持ResizeObserver 使用定时器
    let width = '',
      height = ''
    function get() {
      const style = document.defaultView.getComputedStyle(el)
      if (width !== style.width || height !== style.height) {
        callback({ width, height })
      }
      width = style.width
      height = style.height
    }
    el.__vueReize__ = setInterval(get, 200)
  },
  unbind(el) {
    const { __vueReize__, __resizeObserver__, __bindingValue__ } = el
    // 清除定时器
    __vueReize__ && clearInterval(__vueReize__)
    // 停止观察
    __resizeObserver__ && __resizeObserver__.disconnect()
    // 移除事件监听
    __bindingValue__ && window.removeEventListener('resize', __bindingValue__)
    // // 删除属性
    // delete el.__vueReize__
    // delete el.__resizeObserver__
    // delete el.__bindingValue__
  },
}
