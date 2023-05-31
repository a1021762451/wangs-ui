# ws-ui

## 使用方式

- 安装

```
npm install wangs-ui
```

- 使用

```
import wangsUi from 'wangs-ui'
import 'wangs-ui/lib/wangs-ui.css';
Vue.use(wangsUi)
```

## 组件介绍

### ws-table

#### 特点

- 配置化开发
- 嵌套 el-form 组件
- 单行和多行校验表单元素
- 可根据列内容自适应宽度
- 工具栏支持纯前端下载，可以勾选显示的列
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
  :pageInfo.sync="pageInfo"
  @happenEvent="happenEvent"
  @selection-change="selectionChange"
  ref="wsTable"
  row-key="id"
>
  <template v-slot:expand="{ row }">
    <div>{{ JSON.stringify(row) }}</div>
  </template>
  <template v-slot:plantName_header="{ column }">
    {{ column.label + '--插槽' }}
  </template>
  <template v-slot:plantName="{ row, fieldItem }">
    {{ row.plantName + '--插槽' + fieldItem.prop }}
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
    required: true,
    maxTimeProp: 'testMaxDatetime', // 用于比较的最大时间对应字段
    minDate: '2022-01-01', // 用于比较的最小时间固定值
    maxDate: '2024-01-01', // 用于比较的最大时间固定值
    timeDisabled: true, // 时间限制精度是否到时分秒
    minAllowEqual: false, // 不允许和用于比较的最小时间相等
    maxAllowEqual: false, // 不允许和用于比较的最大时间相等
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
    required: true,
    minTimeProp: 'testMinDatetime', // 用于比较的最小时间对应字段
    minDate: '2022-01-01', // 用于比较的最小时间固定值
    maxDate: '2024-01-01', // 用于比较的最大时间固定值
    timeDisabled: true, // 时间限制精度是否到时分秒
    minAllowEqual: false, // 不允许和用于比较的最小时间相等
    maxAllowEqual: false, // 不允许和用于比较的最大时间相等
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

| 参数           | 说明                   | 类型    | 可选值                                              | 默认值 |
| -------------- | ---------------------- | ------- | --------------------------------------------------- | ------ |
| allOptions     | 所有表单下拉框选项集合 | Object  | -                                                   | -      |
| tableColumns   | 所有列的对象集合数组   | Array   | -                                                   | -      |
| tableButtons   | 每行按钮组             | Array   | -                                                   | -      |
| tableData      | 表单数据               | Array   | -                                                   | -      |
| utilsList      | 工具栏                 | Array   | 'setColumms' - 对应列筛选 'download' - 对应表格下载 | -      |
| showPagination | 展示分页组件           | Boolean | -                                                   | true   |
| pageInfo       | 分页数据               | Object  | -                                                   | -      |
| loading        | 加载样式               | Boolean | -                                                   | false  |

- tableColumns 内部对象属性(兼容 el-table-column 自带的属性， 不另作说明)

| 参数           | 说明                                   | 类型     | 可选值 | 默认值 |
| -------------- | -------------------------------------- | -------- | ------ | ------ |
| slotName       | 对应列插槽名                           | String   | -      | -      |
| headerSlotName | 对应列表头插槽名                       | String   | -      | -      |
| children       | 多级表头配置                           | Array    | -      | -      |
| formatter      | 同 el-table formatter                  | Function | -      | -      |
| selfAdjust     | 列宽根据内容自调节                     | Boolean  | -      | false  |
| component      | 组件名，用于表单组件                   | String   | -      | -      |
| blurHandler    | el-input 组件失焦时值过滤              | Function | -      | -      |
| inputHandler   | el-input 组件输入时值过滤              | Function | -      | -      |
| required       | 是否必填                               | Boolean  | -      | false  |
| alwaysVisible  | 列是否一直展示                         | Boolean  | -      | false  |
| maxTimeProp    | 时间组件最大值对应的字段               | String   | -      | -      |
| minTimeProp    | 时间组件最小值对应的字段               | String   | -      | -      |
| minDate        | 固定的最小时间                         | String   | -      | -      |
| maxDate        | 固定的最大时间                         | String   | -      | -      |
| timeDisabled   | 时间限制精度是否到时分秒               | Boolean  | -      | -      |
| minAllowEqual  | 允许和用于比较的最小时间相等, 精度到天 | Boolean  | -      | true   |
| maxAllowEqual  | 允许和用于比较的最大时间相等, 精度到天 | Boolean  | -      | true   |
| allowToggle    | 是否允许双击切换， 仅支持输入框        | Boolean  | -      | -      |
| componentAttrs | 组件对应的属性                         | Object   | -      | -      |

#### 组件事件

| 事件名      | 说明           | 参数      |
| ----------- | -------------- | --------- |
| happenEvent | 行按钮点击事件 | eventData |

#### 组件方法

| 事件名      | 说明       | 参数        |
| ----------- | ---------- | ----------- |
| validateRow | 校验单行   | row：行数据 |
| validateAll | 校验全部行 | -           |

#### slot 插槽

tableColumns 配置 slotName 和 headerSlotName
，也支持按钮组 ws-buttons 配置的插槽

### ws-form

#### 特点

- 配置化开发
- 支持搜索栏模式和普通表单模式
- 搜索栏模式自适应增加折叠按钮
- 保留`elementui el-form`原有功能

#### 使用方式

- 组件使用

```html
<ws-form
  :formConfigList="formConfigList"
  :formButtons="formButtons"
  :allOptions="allOptions"
  :formData.sync="formData"
  buttonSize="small"
  isSearchList
  @happenEvent="happenEvent"
  style="margin-bottom: 10px"
  ref="wsForm"
>
  <!-- 指向ws-form组件的插槽 -->
  <template #lightOut="{ fieldItem, formData }">
    <el-input
      clearable
      v-model="formData[fieldItem.prop]"
      :placeholder="fieldItem.disabled ? '' : '请输入内容'"
      :disabled="fieldItem.disabled"
    ></el-input>
  </template>
  <!-- 指向ws-buttons组件的插槽 -->
  <template #download="scope">
    <el-button type="primary" size="small" @click="happenEvent(scope)"
      >下载</el-button
    >
  </template>
</ws-form>
```

- 配置示例

```javascript
// 表单配置
export const formConfigList = [
  {
    component: 'el-select',
    prop: 'applyComId',
    label: '申请单位申请单位申请单位',
    required: true,
  },
  {
    component: 'el-input',
    prop: 'protectContent',
    label: '检修内容',
    componentAttrs: {
      type: 'textarea',
    },
  },
  {
    component: 'el-date-picker',
    prop: 'endTime_min',
    label: '竣工日期小',
    required: true,
    maxTimeProp: 'endTime_max',
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
    label: '竣工日期大',
    required: true,
    minTimeProp: 'endTime_min',
    // isShowCurrent: true,
    componentAttrs: {
      type: 'date',
      valueFormat: 'yyyy-MM-dd',
    },
  },
  {
    slotName: 'lightOut',
    prop: 'lightOut',
    label: '光年之外',
    required: true,
  },
]
```

#### 组件属性

| 参数              | 说明                                | 类型    | 可选值 | 默认值 |
| ----------------- | ----------------------------------- | ------- | ------ | ------ |
| allOptions        | 所有表单下拉框选项集合，同 ws-table | Object  | -      | -      |
| formConfigList    | 表单元素配置数组                    | Array   | -      | -      |
| formButtons       | 按钮组配置                          | Array   | -      | -      |
| buttonSize        | 按钮组尺寸                          | String  | -      | small  |
| formData          | 表单数据                            | Object  | -      | -      |
| colon             | 标签后面是否有冒号                  | Boolean | -      | true   |
| isSearchList      | 是否是搜索控件                      | Boolean | -      | false  |
| useDeafultButtons | 是否使用默认的查询重置按钮          | Boolean | -      | true   |
| gutter            | el-row 属性                         | Number  | -      | 12     |

- formConfigList 内部对象属性(兼容 el-form-item 自带的属性， 不另作说明)

| 参数            | 说明                                             | 类型     | 可选值 | 默认值 |
| --------------- | ------------------------------------------------ | -------- | ------ | ------ |
| slotName        | 表单元素内容插槽                                 | String   | -      | -      |
| component       | 组件名，用于表单组件                             | String   | -      | -      |
| blurHandler     | el-input 组件失焦时值过滤                        | Function | -      | -      |
| inputHandler    | el-input 组件输入时值过滤                        | Function | -      | -      |
| required        | 是否必填                                         | Boolean  | -      | false  |
| maxTimeProp     | 时间组件最大值对应的字段                         | String   | -      | -      |
| minTimeProp     | 时间组件最小值对应的字段                         | String   | -      | -      |
| minDate         | 固定的最小时间                                   | String   | -      | -      |
| maxDate         | 固定的最大时间                                   | String   | -      | -      |
| timeDisabled    | 时间限制精度是否到时分秒                         | Boolean  | -      | -      |
| minAllowEqual   | 允许和用于比较的最小时间相等,精度到天            | Boolean  | -      | true   |
| maxAllowEqual   | 允许和用于比较的最大时间相等,精度到天            | Boolean  | -      | true   |
| defaultTimeType | 默认时间类型，支持去年/今年/明年的昨天/明天/今天 | String   | -      | ''     |
| componentAttrs  | 组件对应的属性                                   | Object   | -      | -      |

#### 组件事件

| 事件名      | 说明           | 参数      |
| ----------- | -------------- | --------- |
| happenEvent | 行按钮点击事件 | eventData |

#### slot 插槽

formConfigList 配置 slotName, 也支持按钮组 ws-buttons 配置的插槽

### 组件示例图片

#### ws-table

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-table.png)

#### ws-form-普通模式

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-form.png)

#### ws-form-搜索模式

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-form-search.png)

#### ws-checkbox

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-checkbox.png)

#### ws-tree

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-tree.png)

#### ws-echarts

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-echarts.png)
