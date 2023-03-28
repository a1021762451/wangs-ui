# ws-ui

## 使用方式

- 安装

```
npm install wangs-ui
```

- 引用

```
import wangsUi from 'wangs-ui'
import 'wangs-ui/lib/wangs-ui.css';
```

## 组件介绍

### ws-table

#### 特点

- 配置化开发
- 嵌套 el-form 组件
- 单行和多行校验表单元素
- 可根据列内容自适应宽度
- 工具栏支持纯前端下载，显示列的勾选
- 保留`elementui el-table`原有功能

#### 使用方式

- 组件使用

```html
<ws-table
  style="height: 450px"
  :loading="loading"
  :tableData="tableData"
  :tableColumns="tableColumns"
  :allOptions="allOptions"
  :utilsList="['setColumms', 'download']"
  :header-cell-style="{ background: '#f3f3f3' }"
  @happenEvent="happenEvent"
  @selection-change="selectionChange"
  ref="wsTable"
>
  <template v-slot:expand="{ row }">
    <div>{{ JSON.stringify(row) }}</div>
  </template>
  <template v-slot:plantName_header="{ column }">
    <div>{{ column.label + '--插槽' }}</div>
  </template>
  <template v-slot:plantName="{ row, fieldItem }">
    <div>{{ row.plantName + '--插槽' + fieldItem.prop }}</div>
  </template>
</ws-table>
```

- 配置示例

```javascript
// 表格列配置
export const tableColumns = [
  { type: 'selection' },
  // 测试多级表头
  {
    label: '测试多级表头',
    children: [
      {
        prop: 'name',
        label: '姓名',
        alwaysVisible: true,
      },
    ],
  },
  // 自定义表头，内容
  {
    headerSlotName: 'plantName_header',
    slotName: 'plantName',
    prop: 'plantName',
    label: '测试插槽',
    showOverflowTooltip: true,
  },
  // 过滤举例
  {
    prop: 'testFormatter',
    label: '测试过滤',
    formatter: function (cellValue, row, column, index) {
      return cellValue + '-过滤'
    },
    showOverflowTooltip: true,
  },
  // 宽度自调节举例
  { prop: 'widthAdjust', label: '宽度自调节', selfAdjust: true },
  // 输入框模式举例
  {
    prop: 'testInput',
    label: '测试输入框',
    component: 'el-input',
    allowToggle: true,
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
    required: true,
  },
  // 测试下拉框
  {
    prop: 'testSelect',
    label: '测试下拉框',
    component: 'el-select',
    width: 200,
    required: true,
  },
  // 测试时间框模式
  {
    prop: 'testMinDatetime',
    label: '测试时间框小',
    width: 200,
    component: 'el-date-picker',
    maxTimeProp: 'testMaxDatetime',
    minDate: '2022-01-01',
    maxDate: '2024-01-01',
    required: true,
    // timeDisabled: true, // 时间大小限制精度到时分秒
    // minAllowEqual: false, // 不允许和minTimeProp对应的小时间相等
    // maxAllowEqual: false, // 不允许和maxTimeProp对应的大时间相等
    componentAttrs: {
      type: 'datetime',
      valueFormat: 'yyyy-MM-dd HH:mm',
      format: 'yyyy-MM-dd HH:mm',
    },
  },
  {
    prop: 'testMaxDatetime',
    label: '测试时间框大',
    width: 200,
    component: 'el-date-picker',
    minTimeProp: 'testMinDatetime',
    required: true,
    // timeDisabled: true,
    // minAllowEqual: false, // 不允许和对应的小时间相等
    // maxAllowEqual: false, // 不允许和对应的大时间相等
    componentAttrs: {
      type: 'datetime',
      valueFormat: 'yyyy-MM-dd HH:mm',
      format: 'yyyy-MM-dd HH:mm',
    },
  },
  {
    type: 'operation',
    tableButtons: [
      {
        method: 'viewDetail',
        label: '查看',
      },
    ],
  },
]
```

- 下拉框选项

```javascript
const allOptions = {
  testSelect: [
    { label: '苹果', value: '苹果' },
    { label: '香蕉', value: '香蕉' },
  ],
}
```

#### 组件属性

| 参数         | 说明                   | 类型   | 可选值                                              | 默认值 |
| ------------ | ---------------------- | ------ | --------------------------------------------------- | ------ |
| allOptions   | 所有表单下拉框选项集合 | Object | -                                                   | -      |
| tableColumns | 所有列的对象集合数组   | Array  | -                                                   | -      |
| tableButtons | 每行按钮组             | Array  | -                                                   | -      |
| tableData    | 表单数据               | Array  | -                                                   | -      |
| utilsList    | 工具栏                 | Array  | 'setColumms' - 对应列筛选 'download' - 对应表格下载 | -      |

- tableColumns 内部对象属性(兼容 el-table-column 自带的属性， 不另作说明)

| 参数           | 说明                            | 类型     | 可选值 | 默认值 |
| -------------- | ------------------------------- | -------- | ------ | ------ |
| slotName       | 对应列插槽名                    | String   | -      | -      |
| headerSlotName | 对应列表头插槽名                | String   | -      | -      |
| children       | 多级表头配置                    | Array    | -      | -      |
| formatter      | 同 el-table formatter           | Function | -      | -      |
| selfAdjust     | 列宽根据内容自调节              | Boolean  | -      | false  |
| component      | 组件名，用于表单组件            | String   | -      | -      |
| blurHandler    | el-input 组件失焦时值过滤       | Function | -      | -      |
| inputHandler   | el-input 组件输入时值过滤       | Function | -      | -      |
| required       | 是否必填                        | Boolean  | -      | false  |
| maxTimeProp    | 时间组件最大值对应的字段        | String   | -      | -      |
| minTimeProp    | 时间组件最小值对应的字段        | String   | -      | -      |
| minDate        | 固定的最小时间                  | String   | -      | -      |
| maxDate        | 固定的最大时间                  | String   | -      | -      |
| timeDisabled   | 时间限制精度是否到时分秒        | Boolean  | -      | -      |
| allowToggle    | 是否允许双击切换， 仅支持输入框 | Boolean  | -      | -      |
| componentAttrs | 组件对应的属性                  | Object   | -      | -      |

#### 组件事件

| 事件名      | 说明           | 参数      |
| ----------- | -------------- | --------- |
| happenEvent | 行按钮点击事件 | eventData |

#### slot 插槽

tableColumns 配置 slotName 和 headerSlotName

### 组件示例图片

#### ws-table

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-table.png)

#### ws-form-普通模式

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-form.png)

#### ws-form-搜索模式

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-form-search.png)

#### ws-checkbox

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-checkbox.png)

#### ws-treee

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-tree.png)

#### ws-echarts

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-echarts.png)
