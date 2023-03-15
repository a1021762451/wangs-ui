# ws-ui

## 使用方式

- 安装

```
npm install wangs-ui
npm install element-ui
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
- 保留`elementui el-table`原有功能

#### 使用方式

- 组件使用

```html
<ws-table
  style="height: 450px"
  :loading="loading"
  :tableData="tableData"
  :tableColumns="tableColumns"
  :tableButtons="tableButtons"
  :allOptions="allOptions"
  globalMinDate="2022-01-22"
  globalMaxDate="2024-01-22"
  @happenEvent="happenEvent"
  @selection-change="selectionChange"
  ref="wsTable"
>
  <template v-slot:expand="{ row }">
    <div>展开行插槽：{{ JSON.stringify(row) }}</div>
  </template>
  <template v-slot:plantName_header="{ column }">
    <div>{{ column.label + '--表头插槽' }}</div>
  </template>
  <template v-slot:plantName="{ row, fieldItem }">
    <div>{{ row.plantName + '--插槽' + fieldItem.prop }}</div>
  </template>
</ws-table>
```

- 列配置

```javascript
// 表格列配置
const tableColumns = [
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
    // maxTime/minTime 指定互相限制的时间字段
    maxTime: 'testMaxDatetime',
    required: true,
    componentAttrs: {
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
    componentAttrs: {
      type: 'datetime',
      'value-format': 'yyyy-MM-dd HH:mm',
      format: 'yyyy-MM-dd HH:mm'
    }
  }
]
// 按钮组配置同tableButtons
```

- 按钮配置

```javascript
const tableButtons = [
  {
    method: 'viewDetail',
    label: '查看'
  },
  {
    method: 'edit',
    label: '编辑'
  }
]
```

- 下拉框选项

```javascript
const allOptions = {
  testSelect: [
    { label: '苹果', value: '苹果' },
    { label: '香蕉', value: '香蕉' }
  ]
}
```

#### 组件属性

| 参数         | 说明                   | 类型   | 可选值 | 默认值 |
| ------------ | ---------------------- | ------ | ------ | ------ |
| allOptions   | 所有表单下拉框选项集合 | Object | -      | -      |
| tableColumns | 所有列的对象集合数组   | Array  | -      | -      |
| tableButtons | 每行按钮组             | Array  | -      | -      |
| tableData    | 表单数据               | Array  | -      | -      |

- tableColumns 内部属性(兼容 el-table-column 自带的属性， 不另作说明)

| 参数           | 说明                      | 类型     | 可选值 | 默认值 |
| -------------- | ------------------------- | -------- | ------ | ------ |
| slotName       | 对应列插槽名              | String   | -      | -      |
| headerSlotName | 对应列表头插槽名          | String   | -      | -      |
| childrens      | 多级表头配置              | Array    | -      | -      |
| formatter      | 同 el-table formatter     | Function | -      | -      |
| selfAdjust     | 列宽根据内容自调节        | Boolean  | -      | false  |
| component      | 组件名，用于表单组件      | String   | -      | -      |
| blurHandler    | el-input 组件失焦时值过滤 | Function | -      | -      |
| inputHandler   | el-input 组件输入时值过滤 | Function | -      | -      |
| required       | 是否必填                  | Boolean  | -      | false  |
| maxTime        | 时间组件最大值对应的字段  | String   | -      | -      |
| minTime        | 时间组件最小值对应的字段  | String   | -      | -      |
| componentAttrs | 组件对应的属性            | Object   | -      | -      |

- tableButtons 内部属性(兼容 el-button 自带的属性， 不另作说明)

| 参数         | 说明               | 类型   | 可选值 | 默认值 |
| ------------ | ------------------ | ------ | ------ | ------ |
| method       | 点击时触发的方法名 | String | -      | -      |
| label        | 按钮名称           | String | -      | -      |
| tableButtons | 每行按钮组         | Array  | -      | -      |
| tableData    | 表单数据           | Array  | -      | -      |

#### `config`属性

| 参数      | 说明                                                           | 类型           | 可选值     | 默认值 |
| --------- | -------------------------------------------------------------- | -------------- | ---------- | ------ |
| index     | 控制显示索引列,当为 Object 时可以添加`el-table-column`中的属性 | Boolean/Object | -          | false  |
| selection | 控制显示 check 多选列的显示                                    | Boolean/Object | -          | false  |
| filter    | 控制所有列自定义筛选是否可用                                   | Boolean        | true/false | true   |

### 增加事件

| 事件名                              | 说明                                                        | 参数                       |
| ----------------------------------- | ----------------------------------------------------------- | -------------------------- |
| e-filter-change                     | 筛选数据变化时触发                                          | value, column, filtedList  |
| cell-value-change                   | 编辑单元格数据变化时触发                                    | value,row,column,columnObj |
| pagination-${ElPaginationEventName} | 分页事件，以`'pagination-'`开头连接`ElPagination`的事件名称 | `ElPagination`事件参数     |

### `columns`中增加的属性

| 参数               | 说明                                                                                 | 类型       | 可选值                                | 默认值                 |
| ------------------ | ------------------------------------------------------------------------------------ | ---------- | ------------------------------------- | ---------------------- |
| defaultHeader      | 是否使用`el-table`默认列表头,如果要使用默认表头必须设为 true                         | Boolean    | true/false                            | false                  |
| filter             | 是否开启自定义筛选                                                                   | Boolean    | true/false                            | false                  |
| filterType         | 内置下拉筛选类型                                                                     | String     | 'selection' / 'single' / 'datePicker' | 'selection'            |
| filterComponent    | 自定义下拉筛选组件（后面细讲用法）                                                   | Compontent | -                                     | -                      |
| filterAttrs        | 筛选组件可接收的属性对象                                                             | Object     | -                                     | -                      |
| filterListeners    | 筛选组件触发事件接受对象                                                             | Object     | -                                     | -                      |
| getFilters         | 当前列筛选获取筛选数据函数，必须返回一个`resolve`的`Promise`                         | Function   | -                                     | -                      |
| edit               | 控制是否可编辑                                                                       | Boolean    | true/false                            | false                  |
| editType           | 内置编辑类型                                                                         | String     | 'default'/'selection'                 | 'default'              |
| editControl        | 控制这一列中每一行是否可编辑，必须返回`true`or`false`,接受参数：（value,row,column） | Function   | true                                  | -                      |
| editAttrs          | 编辑组件可接收的属性对象                                                             | Object     | -                                     | -                      |
| editListeners      | 编辑组件触发的事件接受对象                                                           | Object     | -                                     | -                      |
| editComponent      | 自定义编辑组件                                                                       | Component  | -                                     | -                      |
| renderCell         | 自定义渲染单元格 Function，接收参数（h,value,row,column）                            | Function   | -                                     | -                      |
| formatter          | 格式化显示单元格内容，接收参数（value,row,column）                                   | Function   | -                                     | -                      |
| filterTransition   | 下拉筛选 popoverc 出现动画                                                           | String     | -                                     | 'el-falel-zoom-in-top' |
| filterPopperClass  | 下拉筛选 popover 添加类名                                                            | String     | -                                     | -                      |
| filterPlacement    | 下拉筛选出现相对位置                                                                 | String     | 同`el-popover`组件参数                | 'bottom'               |
| filterVisibleArrow | 是否显示下拉筛选箭头                                                                 | Boolean    | true/false/                           | false                  |
| hidden             | 控制是否显示该列                                                                     | Boolean    | true/false                            | false                  |
| valueAsHtml        | 单元格显示字符是否作为 html 字符串解析                                               | Boolean    | true/false                            | false                  |

### slot 插槽

同`el-table`的插槽

#### `filterComponent`具体使用

```javascript
<script>
import myComponent from "./myComponent.vue"

columns:[{
    prop:'custom',
    label:'自定义组件',
    filterComponent: myComponent,
    filterAttrs:{
        size:'mini',
        //...
    },
    filterListeners:{
        focus:(e)=>{
            //code
        },
        //...
      }
    },
]
</script>
```

你可以自定义下拉组件，和内置下拉筛选组件一样接受如下`props`，也可以通过`filterAttrs`增加属性，`filterListeners`可以接受你组件的事件响应。

- **filters** ：通过`getfilters`传入的数据
- **filtedList** ：当前已筛选数据（Array）
- **column** ：column 对象
- **columnObj** ： `columns`里面的自身对象
- **showPopover** ： 下拉 popover 的显示状态 true/false

如果数据改变应当给父级相应一个事件，这样才能让内部知道你的数据变了，才能在`e-filter-change`获取你最新数据。

事件：**`this.$emit('filterChange',newValue,columnObj,column)`**

- filterChange： 事件名
- newValue: 最新的筛选数据
- columnObj：`columns`里面的自身对象
- column： column 对象

表格内部操作删除了筛选该列的数据时应做出响应，还有每次点击下拉筛选时应该保持数据一直，可以这样做（仅供参考）

- 实时监听是否已被筛选，可以使用`computed`计算，列如：

```javascript
computed: {
        isFilted() {
            let colKey = this.column.columnKey || this.column.property || this.column.id
            if (this.filtedList.hasOwnProperty(colKey) && this.filtedList[colKey].value) {
                let value = this.filtedList[colKey].value;
                if (value.length == 0) {
                    return false
                }
                return true
            }
         return false
 }
```

- 监听下拉状态,新传入的`filters`,和`isFilted`,做出响应 用`watch`属性

```javascript
 watch: {
        showPopper: {
            immediate: true,
            handler(n) {
                //做你自己的逻辑处理
            }
        },
        filters: {
            immediate: true,
            handler(n) {
                this.filterValues = [...n];  //filterValue 为你组件的绑定的值
            }
        },
        isFilted(n) {
            if (!n) { //如果已经清除当前筛选状态
                this.reInit ? this.reInit() : null //reInit 为将你组件绑定的值初始化，例如为重置为 []
            }
        }
    }
```

> 为什么不直接将`filtedList`直接作为绑定值有如下原因
>
> - 每个组件可能绑定的默认值类型不一样 而`filtedList`为方面操作全部转为`Array`
> - 会直接操作修改父级数据不是，Vue 倡导的，因保持`props`的单向数据流
> - 可以更灵活的使用组件

#### `editComponent`的具体使用

> 示例参考`filterComponent`, 相对于`filterComponent`使用就简单许多了，同理，会接受如下`props`，也可以通过`editAttrs`增加属性，`editListeners`可以接受你组件的响应事件

- **value\_** ： 当前单元格内的值（注意**\_**）
- **column**：当前列对象
- **row**：当前行数据对象
- **columnObj**：`columns`中自身对象

当你改变原数据时也应该通知父级,不然原数据无法更改。（不应该直接将`value_`作为你组件绑定的值，而应该 caopy 一份，例如在`data`里面重新什么一个属性将`value_`的值赋给他）

事件：**`this.$emit('change',value)`**

> 如果你只是基于`elementUI`可编辑类组件经行二次修改的话通过`$listeners`属性你或许都可以不写这个事件，因 为基本都会有这个 change 事件响应。
>
> 不过`change`事件就不能在`editListeners`获取到了,不过你可以在`cell-value-change`的 table 事件中获取。

---

### 部分效果

![编辑-选择](https://raw.githubusercontent.com/Lozvoe/E-Table/master/src/image/%E7%BC%96%E8%BE%91-%E9%80%89%E6%8B%A9.gif)
![筛选](https://github.com/Lozvoe/E-Table/blob/master/src/image/%E7%AD%9B%E9%80%89.gif?raw=true)

## 组件示例图片

### ws-table

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-table.png)

### ws-form-普通模式

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-form.png)

### ws-form-搜索模式

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-form-search.png)

### ws-checkbox

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-checkbox.png)

### ws-treee

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-tree.png)

### ws-echarts

![](https://ws-ui.oss-cn-beijing.aliyuncs.com/ws-echarts.png)
