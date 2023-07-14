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
let getAttrsCount = 0
let getPickerCount = 0

// 获取所有的配置属性
export function getAttrs(fieldItem, formData = {}, isDetail) {
  getAttrsCount += 1
  // console.log(getAttrsCount, 'getAttrsCount');
  let obj = {}
  if (
    fieldItem.component === 'el-date-picker' ||
    fieldItem.component === 'el-time-select' ||
    fieldItem.component === 'el-time-picker'
  ) {
    obj['picker-options'] = getPicker(fieldItem, formData)
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
export const debounce = (fn, delay = 500) => {
  let timer
  return function () {
    let args = arguments //注意如果要传参的话 这句不能省略
    if (timer) {
      // console.log('防抖中')
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, args)
    }, delay)
  }
}
// 节流
export const throttle = (fn, delay = 500) => {
  let timer
  return function () {
    let args = arguments //注意如果要传参的话 这句不能省略
    if (timer) {
      // console.log('节流中')
      return
    }
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, args)
    }, delay)
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

// 下划线转驼峰
export function formatToHump(value) {
  if (!value) return ''
  const lowValue = value.toLowerCase()
  return lowValue.replace(/\_(\w)/g, (_, letter) => letter.toUpperCase())
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

// 时间框时间选择进行限制
export function getPicker(fieldItem, formData) {
  // getPickerCount += 1
  // console.log(getPickerCount, 'getPickerCount');

  // 初始化参数
  let {
    component,
    minAllowEqual = true,
    maxAllowEqual = true,
    timeDisabled,
    minTime = 0,
    maxTime = 0,
    minDate = 0,
    maxDate = 0,
    minTimeProp,
    maxTimeProp,
  } = fieldItem
  const componentAttrs = fieldItem.componentAttrs || {}
  const { type, isRange, valueFormat, pickerOptions = {} } = componentAttrs

  // 如果是范围选择则 不进行限制
  if (/range/i.test(type) || isRange) return {}
  const minValue = formData[minTimeProp] || 0
  const maxValue = formData[maxTimeProp] || 0

  // el-date-picker组件
  if (component === 'el-date-picker') {
    // 单独处理日月年限制
    const minTimeValue = () =>
      +new Date(format(new Date(minValue), 'yyyy-MM-dd'))
    const maxTimeValue = () =>
      +new Date(format(new Date(maxValue), 'yyyy-MM-dd'))
    minDate = minValue ? minTimeValue() : +new Date(minDate)
    maxDate = maxValue ? maxTimeValue() : +new Date(maxDate)
    let selectableRange = ''
    // timeDisabled控制是否禁用精度到时分秒，副作用时此刻按钮隐藏
    if (timeDisabled) {
      minTime = minTime || '00:00:00'
      maxTime = maxTime || '23:59:59'
      if (minValue && formData[fieldItem.prop]) {
        const isSameDay =
          new Date(minValue).toDateString() ===
          new Date(formData[fieldItem.prop]).toDateString()
        if (isSameDay) {
          const HH = new Date(minValue).getHours()
          const mm = new Date(minValue).getMinutes()
          const ss = new Date(minValue).getSeconds()
          minTime = HH + ':' + mm + ':' + ss
        }
      }
      if (maxValue && formData[fieldItem.prop]) {
        const isSameDay =
          new Date(maxValue).toDateString() ===
          new Date(formData[fieldItem.prop]).toDateString()
        if (isSameDay) {
          const HH = new Date(maxValue).getHours()
          const mm = new Date(maxValue).getMinutes()
          const ss = new Date(maxValue).getSeconds()
          maxTime = HH + ':' + mm + ':' + ss
        }
      }
      selectableRange = minTime + '-' + maxTime
    }
    return {
      disabledDate(time) {
        time = +new Date(format(new Date(time), 'yyyy-MM-dd'))
        let minCondition = false
        let maxCondition = false
        minCondition = minAllowEqual ? minDate <= time : minDate < time
        maxCondition = maxAllowEqual ? time <= maxDate : time < maxDate
        if (maxDate) {
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
    minTime = minValue || minTime || '00:00'
    maxTime = maxValue || maxTime || '23:59'
    return {
      start: minTime || '00:00',
      end: maxTime || '23:59',
      ...pickerOptions,
      // minTime: minValue,
      // maxTime: maxValue
    }

    // el-time-picker组件
  } else if (component === 'el-time-picker') {
    // 秒级别控制不了
    let selectableRange = ''
    // 处理minTime
    minTime = minValue || minTime || '00:00:00'
    minTime =
      typeof minTime === 'string' ? minTime : format(minTime, 'HH:mm:ss')
    const minO = decodeFormatTime(minTime, valueFormat || 'HH:mm:ss')
    minTime = encodeFormatTime(minO, 'HH:mm:ss')
    // 处理maxTime
    maxTime = maxValue || maxTime || '23:59:59'
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
export function treeDataFlat(data = [], props = {}, nodeKey = 'id') {
  let { children = 'children', parent = 'pid' } = props
  const result = []
  if (!Array.isArray(data)) return result
  const loop = (data, parentId = null) => {
    data.forEach((item) => {
      item[parent] = parentId
      result.push(item)
      if (item[children] && item[children].length) {
        loop(item[children], item[nodeKey])
      }
    })
  }
  loop(data)
  return result
}
// 扁平数据转树
export function flatToTree(data = [], props = {}, nodeKey = 'id') {
  data = deepClone(data)
  let { children = 'children', parent = 'pid' } = props
  const result = []
  const map = {}
  if (!Array.isArray(data)) return result
  data.forEach((item) => {
    map[item[nodeKey]] = item
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
