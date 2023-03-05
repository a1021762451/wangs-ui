export const list = [
  'renderButtons',
  'renderForm',
  'renderTable',
  'renderTree',
  'renderEcharts',
  'test'
]
// 按钮组配置同tableButtons
export const buttonConfigList = [
  {
    method: 'search',
    label: '查看'
  },
  {
    method: 'reset',
    label: '重置',
    type: 'plain',
    size: 'mini'
  },
  {
    method: 'export',
    label: '导出EXCEL',
    icon: 'el-icon-setting'
  },
  {
    slotName: 'download'
  }
]

// 表单配置
export const formConfigList = [
  { type: '1', field: 'applyComId', label: '申请单位', required: true },
  { type: '2', field: 'equipName', label: '停电设备', required: true },
  { type: '3', field: 'equipNum', label: '设备数量', required: true },
  { type: '4', field: 'protectContent', label: '检修内容' },
  {
    type: '5',
    field: 'endTime',
    label: '竣工日期',
    timeFormat: 'yyyy-MM-dd',
    required: true
  },
  {
    slotName: 'lightOut',
    field: 'lightOut',
    label: '光年之外',
    required: true
  }
]

// 下拉框选项
export const allOptions = {
  applyComId: [
    { label: '南昌', value: '南昌' },
    { label: '宁波', value: '宁波' },
    { label: '鹰潭', value: '鹰潭' },
    { label: '上饶', value: '上饶' }
  ]
}

// 表格列配置
export const tableColumns = [
  { type: 'selection' },
  { type: 'index' },
  { type: 'expand', slotName: 'expand' },
  { field: 'plantName', label: '厂站名称' },
  // 宽度自调节举例
  { field: 'widthAdjust', label: '宽度自调节', selfAdjust: true },
  // 输入框模式举例
  {
    field: 'testInput',
    label: '测试输入框',
    eleType: 'input',
    // '如果输入格式为数字加小数点， 去掉小数点'
    blurHandler: function (value) {
      if (/^\d*\.$/.test(value)) {
        return value.replace('.', '')
      }
      return value
    },
    // 限制输入6位小数
    inputHandler: function (value) {
      return value.replace(/^\D*((0|[1-9][0-9]*)(?:\.\d{0,6})?).*$/g, '$1')
    }
  },
  // 复选框模式 对应的值不等于0或者1则代表禁用
  {
    field: 'testCheckBox',
    label: '测试复选框',
    eleType: 'checkBox'
  },
  // 测试下拉框
  {
    field: 'testSelect',
    label: '测试下拉框',
    eleType: 'select',
    options: [
      { label: '苹果', value: '苹果' },
      { label: '香蕉', value: '香蕉' }
    ]
  },
  // 测试时间框模式
  {
    field: 'testMinDatetime',
    label: '测试时间框小',
    eleType: 'datetime',
    timeFormat: 'yyyy-MM-dd',
    params: { maxTime: 'testMaxDatetime' }
  },
  {
    field: 'testMaxDatetime',
    label: '测试时间框大',
    eleType: 'datetime',
    timeFormat: 'yyyy-MM-dd',
    params: { minTime: 'testMinDatetime' }
  },
  {
    field: 'testTime',
    label: '测试时间框(time)',
    eleType: 'datetime',
    timeFormat: 'HH:mm',
    params: { minTime: 'testMinDatetime' }
  }
]

// 按钮组配置同tableButtons
export const tableButtons = [
  {
    method: 'viewDetail',
    label: '查看'
  },
  {
    method: 'edit',
    label: '编辑'
  }
]

// 触发事件
export function happenEvent(eventData) {
  console.log(eventData, 'eventData')
  const { buttonItem = {}, formData, row } = eventData
  buttonItem.method && console.log(buttonItem.method, 'buttonItem.method')
  buttonItem.label && console.log(buttonItem.label, 'buttonItem.label')
  buttonItem.slotName && console.log(buttonItem.slotName, 'buttonItem.slotName')
  console.log(formData, 'formData')
  console.log(row, 'row')
  this[buttonItem.method] && this[buttonItem.method](eventData)
}
