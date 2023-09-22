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
    label: '导出',
  },
  {
    method: 'export',
    label: '删除',
  },
  {
    method: 'export',
    label: '保存',
  },
  {
    method: 'export',
    label: '冻结',
  },
  {
    method: 'export',
    label: '升级版本',
  },
  {
    method: 'export',
    label: '对比',
  },
]

// 表单配置
export const formConfigList = [
  {
    component: 'el-input',
    prop: 'equipId',
    label: '纵密设备ID',
  },
  {
    component: 'el-input',
    prop: 'tunnel',
    label: '隧道',
  },
  {
    component: 'el-input',
    prop: 'strategy',
    label: '策略',
  },
  {
    component: 'el-input',
    prop: 'sourceAddressId',
    label: '源地址ip',
  },
  {
    component: 'el-input',
    prop: 'targetAddressId',
    label: '目标地址ip',
  },
  {
    component: 'el-input',
    prop: 'zfx',
    label: '正反向',
  },
  {
    component: 'el-input',
    prop: 'protocol',
    label: '协议',
  },
  {
    component: 'el-input',
    prop: 'isFreeze',
    label: '是否冻结',
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
    { label: '苹果', value: '苹果' },
    { label: '香蕉', value: '香蕉' },
  ],
}

// 表格列配置
export const tableColumns = [
  { type: 'selection' },
  { type: 'index', label: '序号' },
  { type: 'expand', slotName: 'expand' },
  // {
  //   label: '测试',
  //   prop: 'test',
  //   // fixed: 'right',
  //   width: '400',
  // },
  // 测试多级表头
  {
    label: '省调策略',
    children: [
      {
        prop: 'equipId',
        label: '纵密设备ID',
      },
      {
        prop: 'tunnel',
        label: '隧道',
      },
      {
        prop: 'sourceAddresssStartId',
        label: '源地址开始ip',
        width: '110'
      },
      {
        prop: 'sourceAddresssEndId',
        label: '源地址结束ip',
        width: '110'
      },
      {
        prop: 'targetAddresssStartId',
        label: '目标地址开始ip',
        width: '110'
      },
      {
        prop: 'targetAddresssEndId',
        label: '目标地址结束ip',
        width: '110'
      },
      {
        prop: 'zfx',
        label: '正反向',
      },
      {
        prop: 'protocol',
        label: '协议',
      },
      {
        prop: 'sourceAddressStartPort',
        label: '源地址开始端口',
      },
      {
        prop: 'sourceAddressEndPort',
        label: '源地址结束端口',
      },
      {
        prop: 'targetAddressStartPort',
        label: '目标地址开始端口',
      },
      {
        prop: 'targetAddressEndPort',
        label: '目标地址结束端口',
      },
    ],
  },
  {
    label: '厂站策略',
    children: [
      {
        prop: 'station_equipId',
        label: '纵密设备ID',
      },
      {
        prop: 'station_tunnel',
        label: '隧道',
      },
      {
        prop: 'station_sourceAddresssStartId',
        label: '源地址开始ip',
        width: '110'
      },
      {
        prop: 'station_sourceAddresssEndId',
        label: '源地址结束ip',
        width: '110'
      },
      {
        prop: 'station_targetAddresssStartId',
        label: '目标地址开始ip',
        width: '110'
      },
      {
        prop: 'station_targetAddresssEndId',
        label: '目标地址结束ip',
        width: '110'
      },
      {
        prop: 'station_zfx',
        label: '正反向',
      },
      {
        prop: 'station_protocol',
        label: '协议',
      },
      {
        prop: 'station_sourceAddressStartPort',
        label: '源地址开始端口',
      },
      {
        prop: 'station_sourceAddressEndPort',
        label: '源地址结束端口',
      },
      {
        prop: 'station_targetAddressStartPort',
        label: '目标地址开始端口',
      },
      {
        prop: 'station_targetAddressEndPort',
        label: '目标地址结束端口',
      },
    ],
  },
  {
    type: 'operation',
    label: '操作',
    width: 150,
    buttonConfigList: [
      {
        method: 'gobackLastVersion',
        label: '返回上一版本',
      },
    ],
  },
]
export const tableColumnsRight = [
  { type: 'expand', slotName: 'expand', width: 1, },
  // {
  //   label: '测试',
  //   prop: 'test',
  //   // fixed: 'right',
  //   width: '400',
  // },
  // 测试多级表头
  // {
  //   label: '厂站策略',
  //   children: [
  //     {
  //       prop: 'station_equipId',
  //       label: '纵密设备ID',
  //     },
  //     {
  //       prop: 'station_tunnel',
  //       label: '隧道',
  //     },
  //     {
  //       prop: 'station_sourceAddresssStartId',
  //       label: '源地址开始ip',
  //       width: '110'
  //     },
  //     {
  //       prop: 'station_sourceAddresssEndId',
  //       label: '源地址结束ip',
  //       width: '110'
  //     },
  //     {
  //       prop: 'station_targetAddresssStartId',
  //       label: '目标地址开始ip',
  //       width: '110'
  //     },
  //     {
  //       prop: 'station_targetAddresssEndId',
  //       label: '目标地址结束ip',
  //       width: '110'
  //     },
  //     {
  //       prop: 'station_zfx',
  //       label: '正反向',
  //     },
  //     {
  //       prop: 'station_protocol',
  //       label: '协议',
  //     },
  //     {
  //       prop: 'station_sourceAddressStartPort',
  //       label: '源地址开始端口',
  //     },
  //     {
  //       prop: 'station_sourceAddressEndPort',
  //       label: '源地址结束端口',
  //     },
  //     {
  //       prop: 'station_targetAddressStartPort',
  //       label: '目标地址开始端口',
  //     },
  //     {
  //       prop: 'station_targetAddressEndPort',
  //       label: '目标地址结束端口',
  //     },
  //   ],
  // },
  // {
  //   type: 'operation',
  //   label: '操作',
  //   width: 150,
  //   buttonConfigList: [
  //     {
  //       method: 'gobackLastVersion',
  //       label: '返回上一版本',
  //     },
  //   ],
  // },
]

// 触发事件
export function happenEvent(eventData) {
  console.log(eventData, 'eventData')
  const { buttonItem = {}, formData, row } = eventData
  this[buttonItem.method] && this[buttonItem.method](eventData)
}
