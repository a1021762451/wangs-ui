const globalAttrs = {
  clearable: true
}
const commonAttrs = {
  'el-select': {
    default: {
      filterable: true,
      placeholder: '请选择'
    }
  },
  'el-input': {
    default: {
      placeholder: '请输入'
    },
    textarea: {
      'show-word-limit': true,
      maxlength: 1000,
      placeholder: '请输入',
      rows: 2
    }
  },
  'el-input-number': {
    default: {
      controls: false,
      placeholder: '请输入数字',
      min: 1,
      max: 100,
      step: 1,
      precision: 0
    }
  },
  'el-date-picker': {
    default: {
      placeholder: '选择时间'
    }
  },
  'el-time-picker': {
    default: {
      placeholder: '选择时间'
    }
  },
  'el-time-select': {
    default: {
      placeholder: '选择时间'
    }
  },
  'el-checkbox': {
    default: {
      'true-label': '1',
      'false-label': '0'
    }
  }
}
let getAttrsCount = 0
let getPickerCount = 0
export function getAttrs(
  fieldItem,
  formData = {},
  globalMinDate,
  globalMaxDate
) {
  getAttrsCount += 1
  // console.log(getAttrsCount, 'getAttrsCount');
  let obj = {}
  if (
    fieldItem.component === 'el-date-picker' ||
    fieldItem.component === 'el-time-select' ||
    fieldItem.component === 'el-time-picker'
  ) {
    obj['picker-options'] = getPicker(
      fieldItem,
      formData,
      globalMinDate,
      globalMaxDate
    )
  }
  const allTypes = commonAttrs[fieldItem.component] || {}
  const componentAttrs = fieldItem.componentAttrs || {}
  const type = componentAttrs.type
  obj = {
    ...obj,
    ...globalAttrs,
    ...(allTypes[type] || allTypes.default || {}),
    ...componentAttrs
  }
  obj.placeholder = obj.disabled ? '' : obj.placeholder
  console.log(obj, 'obj')
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
    '[object Object]': 'object'
  }
  if (obj instanceof Element) {
    return 'element'
  }
  return map[toString.call(obj)]
}

// 防抖
export const debounce = (fn, t) => {
  const delay = t || 500
  let timer
  return function () {
    const args = arguments
    if (timer) {
      console.log('防抖中')
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, args)
    }, delay)
  }
}
// 节流
export const throttle = (fn, t) => {
  var prev = Date.now()
  return function () {
    var context = this //this指向window
    var args = arguments
    var now = Date.now()
    if (now - prev >= t) {
      fn.apply(context, args)
      prev = Date.now()
    } else {
      console.log('节流中')
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
export function getPicker(fieldItem, formData, globalMinDate, globalMaxDate) {
  getPickerCount += 1
  // console.log(getPickerCount, 'getPickerCount');
  // console.log(formData, 'formData')'
  const { component, minAllowEqual = true, maxAllowEqual = true } = fieldItem
  const componentAttrs = fieldItem.componentAttrs || {}
  const { type, isRange } = componentAttrs
  if (/range/i.test(type) || isRange) return {}
  // 单独处理日月年限制
  const minField = fieldItem.minTime
  const maxField = fieldItem.maxTime
  const minValue = formData[minField]
  const maxValue = formData[maxField]
  const minTimeValue = () => +new Date(new Date(minValue).format('YYYY-MM-DD'))
  const maxTimeValue = () => +new Date(new Date(maxValue).format('YYYY-MM-DD'))
  const minTime = minValue ? minTimeValue() : +new Date(globalMinDate)
  const maxTime = maxValue ? maxTimeValue() : +new Date(globalMaxDate)
  // console.log(minTime, maxTime, 'minTime, maxTime')
  // 单独处理分秒限制 --- 此方案还有瑕疵，目前用rules控制。
  // let selectableRange = ''
  // let minRange = '00:00:00'
  // let maxRange = '23:59:59'
  // if (minValue && formData[fieldItem.prop]) {
  //   const isSameDay =
  //     new Date(minValue).toDateString() ===
  //     new Date(formData[fieldItem.prop]).toDateString()
  //   if (isSameDay) {
  //     const HH = new Date(minValue).getHours()
  //     const mm = new Date(minValue).getMinutes()
  //     const ss = new Date(minValue).getSeconds()
  //     minRange = HH + ':' + mm + ':' + ss
  //   }
  // }
  // if (maxValue && formData[fieldItem.prop]) {
  //   const isSameDay =
  //     new Date(maxValue).toDateString() ===
  //     new Date(formData[fieldItem.prop]).toDateString()
  //   if (isSameDay) {
  //     const HH = new Date(maxValue).getHours()
  //     const mm = new Date(maxValue).getMinutes()
  //     const ss = new Date(maxValue).getSeconds()
  //     maxRange = HH + ':' + mm + ':' + ss
  //   }
  // }
  // selectableRange = minRange + '-' + maxRange
  if (component === 'el-date-picker') {
    return {
      disabledDate(time) {
        // if (new Date(time).format('YYYY-MM-DD') === '2023-03-09') {
        //   console.log(new Date(time).format('YYYY-MM-DD HH:mm:ss'))
        //   console.log(+new Date(time), +new Date(new Date(time).format('YYYY-MM-DD HH:mm:ss')));
        //   console.log('+new Date(2023-03-09)', time, fieldItem.label)
        // }
        time = +new Date(new Date(time).format('YYYY-MM-DD'))
        let minCondition = false
        let maxCondition = false
        minCondition = minAllowEqual ? minTime <= time : minTime < time
        maxCondition = maxAllowEqual ? time <= maxTime : time < maxTime
        // console.log(minAllowEqual, maxAllowEqual, 'minAllowEqual, maxAllowEqual');
        if (maxTime) {
          return !(minCondition && maxCondition)
        } else {
          return !minCondition
        }
      }
      // selectableRange,
    }
  } else if (component === 'el-time-select') {
    return {
      start: '00:00',
      end: '23:59',
      step: fieldItem.step || '00:05',
      minTime: fieldItem.minTime ? formData[fieldItem.minTime] : null,
      maxTime: fieldItem.maxTime ? formData[fieldItem.maxTime] : null
    }
  } else if (component === 'el-time-picker') {
    let { globalMinTime, globalMaxTime } = fieldItem
    globalMinTime = globalMinTime
      ? globalMinTime.length === 5
        ? globalMinTime + ':00'
        : globalMinTime
      : ''
    globalMaxTime = globalMaxTime
      ? globalMaxTime.length === 5
        ? globalMaxTime + ':00'
        : globalMaxTime
      : ''
    let selectableRange = ''
    let minRange = globalMinTime || '00:00:00'
    let maxRange = globalMaxTime || '23:59:59'
    if (minValue) {
      minRange = minValue.length === 5 ? minValue + ':00' : minValue
    }
    if (maxValue) {
      maxRange = maxValue.length === 5 ? maxValue + ':59' : minValue
    }
    selectableRange = minRange + '-' + maxRange
    console.log(
      minValue,
      maxValue,
      minRange,
      maxRange,
      'minValue, maxValue, minRange,maxRange'
    )
    console.log('selectableRange', selectableRange)
    return {
      selectableRange
    }
  }
}

export function getMinValidator(fieldItem, minValue) {
  const { minAllowEqual = true } = fieldItem
  return function (rule, value, callback) {
    value =
      fieldItem.component === 'el-date-picker' ? value : `1998-06-12 ${value}`
    minValue =
      fieldItem.component === 'el-date-picker'
        ? minValue
        : `1998-06-12 ${minValue}`
    let minCondition =
      minAllowEqual || fieldItem.component !== 'el-date-picker'
        ? +new Date(value) < +new Date(minValue)
        : +new Date(value) <= +new Date(minValue)
    if (minCondition) {
      callback(new Error('请注意时间先后'))
    } else {
      callback()
    }
  }
}

export function getMaxValidator(fieldItem, maxValue) {
  const { maxAllowEqual = true } = fieldItem
  return function (rule, value, callback) {
    value =
      fieldItem.component === 'el-date-picker' ? value : `1998-06-12 ${value}`
    maxValue =
      fieldItem.component === 'el-date-picker'
        ? maxValue
        : `1998-06-12 ${maxValue}`
    let maxCondition =
      maxAllowEqual || fieldItem.component !== 'el-date-picker'
        ? +new Date(value) > +new Date(maxValue)
        : +new Date(value) >= +new Date(maxValue)
    if (maxCondition) {
      callback(new Error('请注意时间先后'))
    } else {
      callback()
    }
  }
}

Date.prototype.format = function (fmt = 'YYYY-MM-DD') {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'D+': this.getDate(), //日
    'H+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  }
  let match
  if ((match = fmt.match(/(Y+)/)))
    fmt = fmt.replace(
      match[1],
      (this.getFullYear() + '').substring(4 - match[1].length)
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
