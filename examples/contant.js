export const list = [
  'ws-form',
  'ws-table',
  'ws-tree',
  'ws-echarts',
  'ws-checkbox',
  'ws-tooltip',
  'ws-select',
  'ws-fold',
  'test',
]
// 按钮组配置同buttonConfigList
export const formButtons = [
  {
    method: 'export',
    label: '导出EXCEL',
    icon: 'el-icon-setting',
    loading: false, // 按钮loading转圈状态
  },
  {
    slotName: 'download',
  },
]

// 表单配置
export const formConfigList = [
  {
    component: 'el-select',
    prop: 'applyComId',
    label: '下拉框',
    required: true,
  },
  {
    component: 'el-input',
    prop: 'equipName',
    label: '输入框',
    required: true,
    // '如果输入格式为数字加小数点， 去掉小数点'
    blurHandler: function (value) {
      if (/^\d*\.$/.test(value)) {
        return value.replace('.', '')
      }
      return value
    },
    // 限制输入6位小数
    inputHandler: function (value) {
      value = value.replace(/[^0-9.]/g, '')
      return value.replace(/^\D*((0|[1-9][0-9]*)(?:\.\d{0,6})?).*$/g, '$1')
    },
  },
  {
    component: 'el-input',
    prop: 'protectContent',
    label: '文本域',
    componentAttrs: {
      type: 'textarea',
    },
  },
  {
    component: 'el-date-picker',
    prop: 'endTime_min',
    label: '小时间',
    required: true,
    maxTimeProp: 'endTime_max', // 用于比较的最大时间对应字段
    timeDisabled: true, // 时间限制精度是否到时分秒
    defaultTimeType: 'today', // 默认当前时间
    componentAttrs: {
      type: 'date',
      valueFormat: 'yyyy-MM-dd',
    },
  },
  {
    component: 'el-date-picker',
    prop: 'endTime_max',
    label: '大时间',
    required: true,
    minTimeProp: 'endTime_min', // 用于比较的最小时间对应字段
    timeDisabled: true, // 时间限制精度是否到时分秒
    // isShowCurrent: true,
    minAllowEqual: false, // 允许和用于比较的最小时间相等 精度到天
    maxAllowEqual: false, // 允许和用于比较的最大时间相等 精度到天
    componentAttrs: {
      type: 'date',
      valueFormat: 'yyyy-MM-dd',
    },
  },
  {
    component: 'el-radio-group',
    prop: 'testRadio',
    label: '单选框',
    required: true,
  },
  {
    component: 'el-checkbox-group',
    prop: 'testCheckbox',
    label: '复选框',
    required: true,
  },
  {
    slotName: 'lightOut',
    prop: 'lightOut',
    label: '插槽',
    required: true,
  },
]

// 下拉框选项
export const allOptions = {
  applyComId: [
    { label: '南昌', value: '南昌' },
    { label: '宁波', value: '宁波' },
    { label: '鹰潭', value: '鹰潭' },
    { label: '上饶', value: '上饶' },
  ],
  testSelect: [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
  ],
  testRadio: [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
  ],
  testCheckbox: [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
  ],
}

// 表格列配置
export const tableColumns = [
  { type: 'selection' },
  { type: 'index', label: '序号' },
  { type: 'expand', slotName: 'expand' },
  // 基本配置
  {
    prop: 'age',
    label: '一般情况',
  },
  // 测试多级表头
  {
    label: '多级表头',
    children: [
      {
        prop: 'name',
        label: '多级表头-1',
        alwaysVisible: true, // 在列选择器中始终显示
        width: 100,
      },
      {
        label: '多级表头-2',
        children: [
          {
            prop: 'adress',
            label: '表头-2-1',
          },
          {
            prop: 'work',
            label: '表头-2-2',
          },
        ],
      },
    ],
  },
  // 自定义表头，内容
  {
    headerSlotName: 'plantName_header',
    slotName: 'plantName',
    prop: 'plantName',
    label: '插槽',
    showOverflowTooltip: true,
  },
  // 过滤举例
  {
    prop: 'testFormatter',
    label: '过滤',
    formatter: function (row, column, cellValue, index) {
      return cellValue + '-过滤'
    },
    showOverflowTooltip: true,
  },
  // 富文本举例
  {
    prop: 'testRich',
    label: '富文本',
    rich: true,
  },
  // 宽度自调节举例
  { prop: 'widthAdjust', label: '宽度自调节', selfAdjust: true },
  // 输入框模式举例
  {
    prop: 'testInput',
    label: '输入框',
    component: 'el-input',
    allowToggle: true, // 是否允许切换显示
    // '如果输入格式为数字加小数点， 去掉小数点'
    blurHandler: function (value) {
      if (/^\d*\.$/.test(value)) {
        return value.replace('.', '')
      }
      return value
    },
    // 限制输入6位小数
    inputHandler: function (value) {
      value = value.replace(/[^0-9.]/g, '')
      return value.replace(/^\D*((0|[1-9][0-9]*)(?:\.\d{0,6})?).*$/g, '$1')
    },
    width: 200,
    required: true,
  },
  // 复选框模式 对应的值不等于0或者1则代表禁用
  {
    prop: 'testCheckBox',
    label: '复选框',
    component: 'el-checkbox',
    alwaysVisible: true,
  },
  // 测试下拉框
  {
    prop: 'testSelect',
    label: '下拉框',
    component: 'el-select',
    width: 200,
    required: true,
    allowToggle: true,
  },
  // 测试时间框模式
  {
    allowToggle: true,
    prop: 'testMinDatetime',
    label: '小时间',
    width: 200,
    component: 'el-date-picker',
    required: true,
    maxTimeProp: 'testMaxDatetime', // 用于比较的最大时间对应字段
    minDate: '2022-01-01', // 用于比较的最小时间固定值
    maxDate: '2024-01-01', // 用于比较的最大时间固定值
    timeDisabled: true, // 时间限制精度是否到时分秒
    minAllowEqual: false, // 不允许和用于比较的最小时间相等  精度到天
    maxAllowEqual: false, // 不允许和用于比较的最大时间相等  精度到天
    componentAttrs: {
      type: 'datetime',
      valueFormat: 'yyyy-MM-dd HH:mm',
      format: 'yyyy-MM-dd HH:mm',
    },
  },
  {
    prop: 'testMaxDatetime',
    label: '大时间',
    width: 200,
    component: 'el-date-picker',
    required: true,
    minTimeProp: 'testMinDatetime', // 用于比较的最小时间对应字段
    minDate: '2022-01-01', // 用于比较的最小时间固定值
    maxDate: '2024-01-01', // 用于比较的最大时间固定值
    timeDisabled: true, // 时间限制精度是否到时分秒
    minAllowEqual: false, // 不允许和用于比较的最小时间相等  精度到天
    maxAllowEqual: false, // 不允许和用于比较的最大时间相等  精度到天
    componentAttrs: {
      type: 'datetime',
      valueFormat: 'yyyy-MM-dd HH:mm',
      format: 'yyyy-MM-dd HH:mm',
    },
  },
  {
    type: 'operation',
    buttonConfigList: [
      {
        method: 'validateRow',
        label: '单验',
      },
      {
        method: 'validateAll',
        label: '全验',
      },
      {
        method: 'edit',
        label: '编辑',
      },
      {
        method: 'notEdit',
        label: '不编辑',
      },
    ],
  },
]

// 触发事件
export function happenEvent(eventData) {
  console.log(eventData, 'eventData')
  const { buttonItem = {}, formData, row } = eventData
  this[buttonItem.method] && this[buttonItem.method](eventData)
}
