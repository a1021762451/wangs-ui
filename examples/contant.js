export const list = [
  'ws-buttons',
  'ws-form',
  'ws-table',
  'ws-tree',
  'ws-echarts',
  'ws-checkbox',
  'test'
]
// 按钮组配置同tableButtons
export const buttonConfigList = [
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
  {
    component: 'el-select',
    prop: 'applyComId',
    label: '申请单位申请单位申请单位',
    required: true
  },
  {
    component: 'el-input',
    prop: 'equipName',
    label: '停电设备',
    required: true
  },
  {
    component: 'el-input-number',
    prop: 'equipNum',
    label: '设备数量',
    required: true
  },
  {
    component: 'el-input',
    prop: 'protectContent',
    label: '检修内容',
    attrs: {
      type: 'textarea'
    }
  },
  {
    component: 'el-date-picker',
    prop: 'endTime_min',
    label: '竣工日期小',
    required: true,
    maxTime: 'endTime_max',
    attrs: {
      type: 'date',
      'value-format': 'yyyy-MM-dd'
    }
  },
  {
    component: 'el-date-picker',
    prop: 'endTime_max',
    label: '竣工日期大',
    required: true,
    minTime: 'endTime_min',
    attrs: {
      type: 'date',
      'value-format': 'yyyy-MM-dd'
    }
  },
  {
    slotName: 'lightOut',
    prop: 'lightOut',
    label: '光年之外',
    required: true
  }
]
export const formConfigList_copy = [
  {
    eleType: 'select',
    prop: 'applyComId',
    label: '申请单位申请单位申请单位',
    required: true
  },
  { eleType: 'input', prop: 'equipName', label: '停电设备', required: true },
  {
    eleType: 'input-number',
    prop: 'equipNum',
    label: '设备数量',
    required: true
  },
  { eleType: 'textarea', prop: 'protectContent', label: '检修内容' },
  {
    eleType: 'datetime',
    prop: 'endTime',
    label: '竣工日期',
    valueFormat: 'yyyy-MM-dd',
    required: true
  },
  {
    slotName: 'lightOut',
    prop: 'lightOut',
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
  ],
  testSelect: [
    { label: '苹果', value: '苹果' },
    { label: '香蕉', value: '香蕉' }
  ],
}

// 表格列配置
export const tableColumns = [
  { type: 'selection' },
  { type: 'index', label: '序号' },
  { type: 'expand', slotName: 'expand' },
  // 测试多级表头
  {
    label: '测试多级表头',
    childrens: [
      {
        prop: 'name',
        label: '姓名'
      },
      {
        prop: 'age',
        label: '年龄'
      },
      {
        label: '测试多级表头-1',
        childrens: [
          {
            prop: 'adress',
            label: '地址'
          },
          {
            prop: 'work',
            label: '工作'
          }
        ]
      }
    ]
  },
  // 自定义表头，内容
  {
    headerSlotName: 'plantName_header',
    slotName: 'plantName',
    prop: 'plantName',
    label: '测试插槽',
    'show-overflow-tooltip': true
  },
  // 过滤举例
  {
    prop: 'testFormatter',
    label: '测试过滤',
    formatter: function (row, column, cellValue, index) {
      console.log(row, column, cellValue, index, 'formatter');
      return cellValue
    },
    'show-overflow-tooltip': true
  },
  // 宽度自调节举例
  { prop: 'widthAdjust', label: '宽度自调节', selfAdjust: true },
  // 输入框模式举例
  {
    prop: 'testInput',
    label: '测试输入框',
    component: 'el-input',
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
    },
    width: 200,
    required: true
  },
  // 复选框模式 对应的值不等于0或者1则代表禁用
  {
    prop: 'testCheckBox',
    label: '测试复选框',
    component: 'el-checkbox'
  },
  // 测试下拉框
  {
    prop: 'testSelect',
    label: '测试下拉框',
    component: 'el-select',
    width: 200,
    required: true
  },
  // 测试时间框模式
  {
    prop: 'testMinDatetime',
    label: '测试时间框小',
    width: 200,
    component: 'el-date-picker',
    maxTime: 'testMaxDatetime',
    required: true,
    attrs: {
      type: 'datetime',
      'value-format': 'yyyy-MM-dd HH:mm',
      format: 'yyyy-MM-dd HH:mm'
    }
  },
  {
    prop: 'testMaxDatetime',
    label: '测试时间框大',
    width: 200,
    component: 'el-date-picker',
    minTime: 'testMinDatetime',
    required: true,
    attrs: {
      type: 'datetime',
      'value-format': 'yyyy-MM-dd HH:mm',
      format: 'yyyy-MM-dd HH:mm'
    }
  },
  {
    prop: 'testTime',
    label: '测试时间框(time)',
    width: 200,
    component: 'el-time-select',
    valueFormat: 'HH:mm',
    required: true,
    attrs: {
      'value-format': 'HH:mm'
    }
  }
]
export const tableColumns_copy = [
  { type: 'selection' },
  { type: 'index', label: '序号' },
  { type: 'expand', slotName: 'expand' },
  // 测试多级表头
  {
    label: '测试多级表头',
    childrens: [
      {
        prop: 'name',
        label: '姓名'
      },
      {
        prop: 'age',
        label: '年龄'
      },
      {
        label: '测试多级表头-1',
        childrens: [
          {
            prop: 'adress',
            label: '地址'
          },
          {
            prop: 'work',
            label: '工作'
          }
        ]
      }
    ]
  },
  // 自定义表头，内容
  {
    headerSlotName: 'plantName_header',
    slotName: 'plantName',
    prop: 'plantName',
    label: '测试插槽',
    formatter: function (value) {
      return value + 'filter'
    },
    'show-overflow-tooltip': true
  },
  // 过滤举例
  {
    prop: 'testFormatter',
    label: '测试过滤',
    formatter: function (value) {
      return value + '--过滤'
    },
    'show-overflow-tooltip': true
  },
  // 宽度自调节举例
  { prop: 'widthAdjust', label: '宽度自调节', selfAdjust: true },
  // 输入框模式举例
  {
    prop: 'testInput',
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
    },
    width: 200,
    required: true
  },
  // 复选框模式 对应的值不等于0或者1则代表禁用
  {
    prop: 'testCheckBox',
    label: '测试复选框',
    eleType: 'checkBox'
  },
  // 测试下拉框
  {
    prop: 'testSelect',
    label: '测试下拉框',
    eleType: 'select',
    width: 200,
    options: [
      { label: '苹果', value: '苹果' },
      { label: '香蕉', value: '香蕉' }
    ],
    required: true
  },
  // 测试时间框模式
  {
    prop: 'testMinDatetime',
    label: '测试时间框小',
    width: 200,
    eleType: 'datetime',
    valueFormat: 'yyyy-MM-dd HH:mm',
    params: { maxTime: 'testMaxDatetime' },
    required: true
  },
  {
    prop: 'testMaxDatetime',
    label: '测试时间框大',
    width: 200,
    eleType: 'datetime',
    valueFormat: 'yyyy-MM-dd HH:mm',
    params: { minTime: 'testMinDatetime' },
    required: true
  },
  {
    prop: 'testTime',
    label: '测试时间框(time)',
    width: 200,
    eleType: 'datetime',
    valueFormat: 'HH:mm',
    params: { minTime: 'testMinDatetime' },
    required: true
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
  this[buttonItem.method] && this[buttonItem.method](eventData)
}
