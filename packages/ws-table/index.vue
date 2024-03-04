<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-12-25 09:24:53
 * @LastEditors: wang shuai
 * @LastEditTime: 2024-03-04 17:06:11
-->
<template>
  <div class="table-container">
    <ws-form
      v-if="showSearch"
      @update:formData="
        (params) => {
          $emit('update:formData', params)
        }
      "
      @happenEvent="happenEvent"
      style="margin-bottom: 6px"
      v-bind="{
        formData: formData,
        isSearchList: true,
        ...seachConfig,
        formConfigList,
      }"
    >
      <!-- 将父组件插槽内容转发给子组件 -->
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
        <slot :name="name" v-bind="scope"></slot>
      </template>
    </ws-form>
    <!-- 工具箱 -->
    <div class="talbe-utils" v-if="utils.length">
      <el-tooltip
        placement="top"
        v-for="util in utils"
        :key="util.content"
        :content="util.content"
      >
        <i
          :class="`${util.icon} icon-setting`"
          @click="happenUtilEvent(util)"
        ></i>
      </el-tooltip>
    </div>
    <!-- 表格头部操作按钮 -->
    <ws-buttons
      v-if="
        Array.isArray(operationConfig.buttonConfigList) &&
        operationConfig.buttonConfigList.length
      "
      class="table-buttons"
      @happenEvent="
        (buttonItem) =>
          $emit('happenEvent', { buttonItem, method: buttonItem.method })
      "
      :style="{
        justifyContent: operationConfig.justifyContent || 'flex-end',
      }"
      v-bind="{
        ...operationConfig,
      }"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
        <slot :name="name" v-bind="{ ...scope }"></slot>
      </template>
    </ws-buttons>
    <!-- 表格 -->
    <component
      :is="containerIsForm ? 'el-form' : 'div'"
      :model="tableForm"
      ref="tableForm"
      label-width="80px"
      :validate-on-rule-change="false"
      inline
      size="mini"
      class="common-table"
      :class="{
        formNoMarginBottom: !hasRequired,
        headerWidthForm: showHeaderSearch && containerIsForm,
      }"
    >
      <!-- 表格 -->
      <el-table
        style="width: 100%"
        :data="tableForm.tableData"
        v-loading="loading"
        v-bind="{
          stripe: true,
          border: true,
          height: '100%',
          'highlight-current-row': true,
          'current-row-key': currentRow[rowKey],
          ...$attrs,
          rowKey,
          'cell-class-name': setCellClassName,
        }"
        @select="select"
        @select-all="selectAll"
        @selection-change="selectionChange"
        @current-change="currentChange"
        @cell-dblclick="cellDblclick"
        v-on="{
          ...$listeners,
          ...(!checkStrictly
            ? {
                select: () => {},
                'select-all': () => {},
                'selection-change': () => {},
                'current-change': () => {},
                'cell-dblclick': () => {},
              }
            : {}),
        }"
        ref="table"
      >
        <!-- 列遍历， 可实现嵌套 -->
        <tableColumn
          v-for="fieldItem in columns"
          :key="fieldItem.label + fieldItem.prop + fieldItem.type"
          :filterButtons="filterButtons"
          :fieldItem="fieldItem"
          :rules="rules"
          :allOptions="allOptions"
          :placeholder="placeholder"
          :switchModeData="switchModeData"
          :switchKey="switchKey"
          :property.sync="property"
          :index.sync="index"
          :formData="formData"
          :showHeaderSearch="showHeaderSearch"
          @happenEvent="happenEvent"
        >
          <!-- 将父组件插槽内容转发给子组件 -->
          <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
            <slot :name="name" v-bind="scope"></slot>
          </template>
        </tableColumn>
        <template v-slot:append>
          <slot name="append"> </slot>
        </template>
      </el-table>
    </component>
    <!-- 分页 -->
    <el-pagination
      v-if="showPagination"
      class="common-table-pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pageInfo.current"
      :page-size.sync="pageInfo.size"
      v-bind="{
        layout: 'total, sizes, prev, pager, next, jumper',
        'page-sizes': [10, 20, 50, 100],
        background: true,
        total: pageInfo.total,
        ...paginationConfig,
      }"
    ></el-pagination>
    <!-- 列展示选择 -->
    <filterColumns
      v-if="utilsList.includes('setColumms')"
      :originColunms="originColunms"
      :columns="columns"
      @filterColumnsConfirm="filterColumnsConfirm"
      ref="filterColumns"
    ></filterColumns>
  </div>
</template>

<script>
let singleColunms = [] // 单条展示
let temColumns = [] // 临时列配置
let temTableData = [] // 临时数据
const allUtils = [
  {
    content: '下载',
    method: 'download',
    icon: 'el-icon-download',
  },
  {
    content: '列设置',
    method: 'setColumms',
    icon: 'el-icon-setting',
  },
  {
    content: '单条展示',
    method: 'showSingle',
    icon: 'el-icon-c-scale-to-original',
  },
]
import {
  debounce,
  deepClone,
  getShowValue,
  treeToFlat,
  getObjAttr,
  vResize,
  getDefaultTime,
  def,
} from '../utils/util'
import mixins from './mixins'
import tableColumn from './components/tableColumn'
import wsForm from '../ws-form/index.vue'
import wsButtons from '../ws-buttons/index.vue'
export default {
  name: 'ws-table',
  mixins: [mixins],
  components: {
    tableColumn,
    filterColumns: () => import('./components/filterColumns'),
    wsForm,
    wsButtons,
  },
  props: {
    // 必传,
    // 表格列
    tableColumns: {
      default() {
        return []
      },
      type: Array,
    },
    // 工具箱
    utilsList: {
      default() {
        return []
      },
      type: Array | String,
    },
    // 表格数据
    data: {
      default() {
        return []
      },
      type: Array,
    },
    // 分页数据
    pageInfo: {
      default() {
        return {}
      },
      type: Object,
    },
    // 加载样式
    loading: {
      type: Boolean,
      default: false,
    },
    // 下拉框选项配置数组
    allOptions: {
      default() {
        return {}
      },
      type: Object,
    },
    // 搜索框配置
    seachConfig: {
      default() {
        return {}
      },
      type: Object,
    },
    // 搜索框数据
    formData: {
      default() {
        return {}
      },
      type: Object,
    },
    // 显示分页
    showPagination: {
      default: true,
      type: Boolean,
    },
    // 显示搜索栏
    showSearch: {
      default: false,
      type: Boolean,
    },
    // 表格单元格占位
    placeholder: {
      default: '',
      type: String,
    },
    // 在显示复选框的情况下，是否严格的遵循父子不互相关联的做法，默认为 false
    checkStrictly: {
      default: false,
      type: Boolean,
    },
    // 表格头部操作按钮
    operationConfig: {
      default() {
        return {}
      },
      type: Object,
    },
    // 列切换模式
    switchMode: {
      default: '', // dblclick/rowControl
      type: String | Array,
    },
    // 列切换字段
    switchKey: {
      default: 'isEdit__table',
      type: String,
    },
    // 分页配置
    paginationConfig: {
      default() {
        return {}
      },
      type: Object,
    },
    // 首行是搜索栏
    showSearchRow: {
      default: false,
      type: Boolean,
    },
    // 标题栏有搜索功能
    showHeaderSearch: {
      default: false,
      type: Boolean,
    },
    // 是否生成默认表单配置
    getDefault: {
      default: false,
      type: Boolean,
    },
    // 过滤表格操作按钮
    filterButtons: {
      default(buttonConfigList, row) {
        return buttonConfigList
      },
      type: Function,
    },
  },
  data() {
    return {
      columns: [], // 列数据
      originColunms: [], // 复制列数据，用于列筛选
      // 用于el-from模式
      tableForm: {
        tableData: [],
      },
      filterColumnsVisable: false, // 列勾选弹窗
      selection: [],
      currentRow: {},
      showSingleStatus: false,
      selectionChange: debounce(this.selectionChangeCallback, 100),
      dataOrColumnsChange: debounce(
        this.dataOrColumnsChangeCallback,
        100,
        true
      ),
      property: '',
      index: '',
      switchModeData: this.switchMode,
    }
  },
  watch: {
    tableColumns: {
      handler(newData) {
        const columns = deepClone(newData)
        this.columns = columns
        // 搜索行处理勾选和索引
        if (this.showSearchRow && !this.showSingleStatus) {
          this.setSelectable(columns)
          this.setIndex(columns)
          // switchModeData 默认有rowControl
          if (!this.switchModeData.includes('rowControl')) {
            if (Array.isArray(this.switchModeData)) {
              this.switchModeData.push('rowControl')
            } else {
              this.switchModeData += this.switchModeData
                ? ',rowControl'
                : 'rowControl'
            }
          }
          // this.setFilterButtons(columns)
        }
        // 初始化表单配置
        this.getDefaultFormConfigList()
        this.addLabelForColumns(columns)
        this.originColunms = deepClone(columns)
      },
      immediate: true,
    },
    // 列表变更更新表单布局
    columns: {
      handler() {
        this.dataOrColumnsChange()
        this.$nextTick(() => {
          this.doLayout()
        })
      },
    },
    data: {
      handler(newData) {
        // 初始化数据
        // this.tableForm.tableData = deepClone(newData)
        // 引用不能丢失 否则表格方法会失效（使用row）
        this.tableForm.tableData = newData
        // 清空勾选
        this.selection = []
        // 重新处理数据
        this.dataOrColumnsChange()
      },
      immediate: true,
    },
  },
  computed: {
    containerIsForm() {
      return this.flatColums.some((item) => {
        return item.component
      })
    },
    hasRequired() {
      return this.flatColums.some((item) => {
        return item.required
      })
    },
    rules() {
      let obj = {}
      const blurEletypes = ['el-input', 'el-input-number']
      this.columns.forEach((fieldItem) => {
        const { component = '', required, disabled } = fieldItem
        if (!required || disabled) return
        const messageSuffix = component.includes('input') ? '输入' : '选择'
        obj[fieldItem.prop] = fieldItem.rule || [
          {
            required: true,
            message: `请${messageSuffix}${fieldItem.label}`,
            trigger: 'change',
            // trigger: blurEletypes.includes(fieldItem.component)
            //   ? 'blur'
            //   : 'change',
          },
        ]
      })
      return obj
    },
    utils() {
      return allUtils.filter((item) => {
        return this.utilsList.includes(item.method)
      })
    },
    treeProps() {
      return getObjAttr(this.$attrs, 'treeProps') || {}
    },
    childrenKey() {
      return this.treeProps.children || 'children'
    },
    rowKey() {
      return getObjAttr(this.$attrs, 'rowKey') || 'id'
    },
    cellClassName() {
      return getObjAttr(this.$attrs, 'cellClassName')
    },
    // 扁平化列
    flatColums() {
      return treeToFlat(this.columns)
    },
    // 扁平化数据
    flatData() {
      return treeToFlat(this.tableForm.tableData)
    },
    // 获取第一个有prop的列
    firstColumnWidthProp() {
      return this.columns.find((item) => !item.type && item.prop)
    },
    formConfigList() {
      return this.getDefaultFormConfigList(true)
    },
  },
  directives: {
    resize: vResize,
  },
  mounted() {
    this.getSingleColunms()
    // window.addEventListener('resize', this.doLayout)
  },
  beforeDestroy() {
    // window.removeEventListener('resize', this.doLayout)
  },
  methods: {
    // 数据或者表格列变更都要执行
    dataOrColumnsChangeCallback() {
      // 初始化首行
      this.initSearchRow()
      // 初始化表头搜索
      this.initHeaderSearch()
      // 表格数据增加prop, 便于校验表单
      this.containerIsForm && this.addFormPropForTable()
      // 配置selfAdjust为true,则宽度自调节
      this.getDynamicWidth(this.columns)
    },
    // 获取单行模式columns
    getSingleColunms() {
      singleColunms = [
        // {
        //   prop: 'prop',
        //   label: '字段',
        // },
        {
          prop: 'propName',
          label: '字段名',
        },
        {
          prop: 'propValue',
          label: '字段值',
        },
      ]
    },
    // 根据表格配置生成默认表单配置
    getDefaultFormConfigList(getForm = false) {
      const { formConfigList = [] } = this.seachConfig
      if (!this.getDefault) return formConfigList
      const arr = []
      this.flatColums.forEach((item) => {
        const { component, prop, label, noDefaultNeed } = item
        // 不需要默认配置
        if (!prop || noDefaultNeed) return
        // 搜索表单默认配置
        if (this.showSearch && getForm) {
          const finditem = formConfigList.find((x) => x.prop === prop)
          arr.push(
            finditem || {
              prop,
              label,
              component: 'el-input',
            }
          )
        }
        // 表格搜索行默认配置
        else if (!getForm) {
          if ((this.showSearchRow || this.showHeaderSearch) && !component) {
            this.$set(item, 'component', 'el-input')
          }
          // if (this.showHeaderSearch && !headerConfig) {
          //   this.$set(item, 'headerConfig', {
          //     component: 'el-input',
          //     prop,
          //   })
          // }
        }
      })
      return arr
    },
    initHeaderSearch() {
      if (!this.showHeaderSearch || this.showSingleStatus) return
      this.initFormData()
    },
    // 根据配置初始化一个row
    initSearchRow() {
      if (!this.showSearchRow || this.showSingleStatus) return
      const { tableData } = this.tableForm
      this.initFormData()
      const obj = this.formData
      def(obj, 'rowType__table', 'searchRow')
      if (tableData[0] && tableData[0].rowType__table === 'searchRow') {
        tableData[0] = obj
      } else {
        tableData.unshift(obj)
      }
      this.switchStatus(obj, true)
    },
    initFormData() {
      this.flatColums.forEach((item) => {
        const { component, defaultTimeType, componentAttrs = {}, prop } = item
        // 设置默认时间
        if (defaultTimeType) {
          this.$set(
            this.formData,
            prop,
            getDefaultTime(defaultTimeType, componentAttrs.valueFormat)
          )
          return
        }
        // 判断是否需要初始化表单值
        if (prop && !this.formData.hasOwnProperty(prop)) {
          this.$set(this.formData, prop, '')
          // 特殊情况
          component === 'el-checkbox-group' &&
            this.$set(this.formData, prop, [])
        }
      })
    },
    // type为slection时 重写selectable属性
    setSelectable(columns) {
      const checkboxColumn = columns.find((item) => item.type === 'selection')
      if (!checkboxColumn) return
      const selectable = checkboxColumn.selectable
      const fn = (row, index) => {
        if (row.rowType__table === 'searchRow') return false
        if (selectable) return selectable(row, index)
        return true
      }
      this.$set(checkboxColumn, 'selectable', fn)
    },
    // type为index时 重写index属性
    setIndex(columns) {
      const indexColumn = columns.find((item) => item.type === 'index')
      if (!indexColumn) return
      const indexFn = indexColumn.index
      const fn = (index) => {
        if (indexFn) return indexFn(index)
        return index == 0 ? '' : index - 1
      }
      this.$set(indexColumn, 'index', fn)
    },
    // type为operation时 重写filterButtons属性
    setFilterButtons(columns) {
      const operationColumn = columns.find((item) => item.type === 'operation')
      if (!operationColumn) return
      const filterButtons = operationColumn.filterButtons
      const fn = (buttonConfigList, row) => {
        if (row.rowType__table === 'searchRow') return []
        if (filterButtons) return filterButtons(buttonConfigList, row)
        return buttonConfigList
      }
      this.$set(operationColumn, 'filterButtons', fn)
    },
    // 设置cellClassName
    setCellClassName({ row, column, rowIndex, columnIndex }) {
      let classStr = ''
      if (
        row.children &&
        row.children.length &&
        column.property === this.firstColumnWidthProp.prop
      ) {
        classStr += 'tree-cell '
      }
      if (row.rowType__table === 'searchRow') classStr += 'search-cell '
      const fieldItem = this.flatColums.find(
        (item) => item.prop === column.property
      )
      if (this.judgeShowFormItem(fieldItem, row, rowIndex))
        classStr += 'form-cell '
      if (this.cellClassName)
        classStr += this.cellClassName({ row, column, rowIndex, columnIndex })
      return classStr
    },
    // 判断是否显示表单元素
    judgeShowFormItem(fieldItem, row, $index) {
      const { switchModeData, switchKey, property, index } = this
      return (
        fieldItem.component &&
        (!switchModeData ||
          (switchModeData.includes('dblclick') &&
            property === fieldItem.prop &&
            index === $index) ||
          (switchModeData.includes('rowControl') && row[switchKey]))
      )
    },
    // 迭代增加label__table，用于多级表头下label作区分
    addLabelForColumns(dataList, fatherLabel = '') {
      fatherLabel = fatherLabel ? `${fatherLabel}-` : ''
      dataList.forEach((item) => {
        const { type, label, prop, children } = item
        if (type) return
        if (children) {
          this.addLabelForColumns(children, `${fatherLabel}` + label)
          return
        }
        // 确保最后一级有label__table
        if (prop) {
          def(item, 'label__table', `${fatherLabel}` + label)
          // item.label__table = `${fatherLabel}` + label
        }
      })
    },
    // 迭代增加prop
    addFormPropForTable() {
      const { tableData } = this.tableForm
      const childrenKey = this.childrenKey
      const iterateAddProp = (data, childrenKey, prop__table) => {
        data.forEach((item, index) => {
          def(item, 'prop__table', `${prop__table}.${index}`)
          // this.$set(item, 'prop__table', `${prop__table}.${index}`)
          // 增加主键
          // item[this.rowKey] = item[this.rowKey] || getRandomId()
          // 编辑模式下，增加切换键
          this.switchModeData.includes('rowControl') &&
            item[this.switchKey] === undefined &&
            this.$set(item, this.switchKey, false)
          // 需要响应式，所以使用this.$set
          // def(item, this.switchKey, false)
          if (item.children) {
            iterateAddProp(
              item.children,
              childrenKey,
              `${prop__table}.${index}.${childrenKey}`
            )
          }
        })
      }
      iterateAddProp(tableData, childrenKey, 'tableData')
    },
    // 遍历获取动态宽度
    getDynamicWidth(columns) {
      const childrenKey = this.childrenKey
      const { tableData } = this.tableForm
      columns.forEach((column) => {
        const conditon = column.selfAdjust
        if (conditon) {
          const arr = this.getColumnData(tableData, column, childrenKey)
          // 迭代获取每一列的所有数据
          arr.push(column.label) // 把每列的表头也加进去算
          this.$set(column, 'width', this.getMaxLength(arr) + 40)
        }
        if (!conditon && column.children) {
          this.getDynamicWidth(column.children)
        }
      })
    },
    // 迭代获取每一列的所有数据
    getColumnData(tableData, column, childrenKey) {
      const arr = []
      tableData.forEach((x) => {
        x[column.prop] && arr.push(x[column.prop])
        if (Array.isArray(x[childrenKey]) && x[childrenKey].length) {
          arr.push(...this.getColumnData(x[childrenKey], column, childrenKey))
        }
      })
      return arr
    },
    // 分页操作
    handleCurrentChange(val) {
      this.$emit('update:pageInfo', { ...this.pageInfo, current: val })
      this.handleSearch()
    },
    handleSizeChange(val) {
      // this.pageInfo.current = 1
      this.$emit('update:pageInfo', { ...this.pageInfo, size: val, current: 1 })
      this.handleSearch()
    },
    handleSearch() {
      this.$emit('happenEvent', {
        method: 'search',
        buttonItem: { method: 'search' },
      })
    },
    happenEvent(params) {
      const {
        buttonItem: { method },
        row,
      } = params
      if (method === 'search') {
        this.$emit('update:pageInfo', { ...this.pageInfo, current: 1 })
      }
      this.$emit('happenEvent', params)
      // 首行搜索逻辑
      // if (
      //   method === 'tableFieldChange' &&
      //   this.showSearchRow &&
      //   row.rowType__table === 'searchRow'
      // ) {
      //   this.$emit('update:pageInfo', { ...this.pageInfo, current: 1 })
      //   this.handleSearch()
      // }
    },
    // 遍历列的所有内容，获取最宽一列的宽度
    getMaxLength(arr) {
      const width = arr.reduce((acc, item) => {
        if (item) {
          let calcLen = this.getTextWidth(item)
          if (acc < calcLen) {
            acc = calcLen
          }
        }
        return acc
      }, 0)
      return width > 600 ? 600 : width
    },
    // 使用span标签包裹内容，然后计算span的宽度 width： px
    getTextWidth(str) {
      let width = 0
      let html = document.createElement('span')
      html.innerText = str
      html.className = 'getTextWidth'
      document.querySelector('body').appendChild(html)
      width = document.querySelector('.getTextWidth').offsetWidth
      document.querySelector('.getTextWidth').remove()
      return width
    },
    // 校验单行
    async validateRow(row) {
      this.switchStatus(row, true)
      await this.$nextTick()
      const props = []
      let allpromise = []
      for (let key in this.rules) {
        props.push(`${row.prop__table}.${key}`)
      }
      this.$refs.tableForm.validateField(props, (valid) => {
        const promise = new Promise((resolve, reject) => {
          if (!valid) resolve()
          else reject()
        })
        allpromise.push(promise)
      })
      return new Promise((resolve) => {
        Promise.all(allpromise)
          .then((res) => {
            resolve(true)
          })
          .catch((err) => {
            resolve(false)
          })
      })
    },
    // 校验全部
    validateAll() {
      return new Promise((resolve, reject) => {
        this.$refs.tableForm.validate((valid) => {
          resolve(valid)
        })
      })
    },
    // 列勾选确认
    filterColumnsConfirm(values) {
      this.columns = []
      this.$nextTick(() => {
        this.columns = this.iterateColumns(
          deepClone(this.originColunms),
          values
        )
      })
      this.$refs.filterColumns.dialogVisable = false
    },
    // 迭代确认勾选列
    iterateColumns(dataList, values) {
      const arr = []
      dataList.forEach((item) => {
        const { type, prop, children } = item
        if (children) {
          const newChildrens = this.iterateColumns(children, values)
          if (newChildrens.length) {
            item.children = newChildrens
            arr.push(item)
          }
          return
        }
        if (type) {
          const newType = `type_${type}`
          if (values.includes(newType)) arr.push(item)
          return
        }
        if (prop) {
          if (values.includes(prop)) arr.push(item)
          return
        }
      })
      return arr
    },
    // 批量勾选， 动态改变selection
    toggleSelection(rows, flag = true) {
      if (!Array.isArray(rows) || !rows.length) return
      rows.forEach((row) => {
        const index = this.selection.indexOf(row)
        this.toggleRowSelection(row, flag)
        if ((index !== -1) !== flag) {
          flag ? this.selection.push(row) : this.selection.splice(index, 1)
        }
      })
    },
    cellDblclick(row, column, cell, event) {
      if (this.switchModeData.includes('dblclick')) {
        const index = this.flatData.indexOf(row)
        this.property = column.property
        this.index = index
      }
      this.$emit('cell-dblclick', row, column, cell, event)
    },
    // 勾选操作
    selectionChangeCallback(selection) {
      !this.checkStrictly && this.$emit('selection-change', this.selection)
    },
    // 全选
    selectAll(selection) {
      const { tableData } = this.tableForm
      tableData.forEach((item) => {
        const condition = selection.includes(item)
        // selectAll没有同步更新selection，所以需要传自己own
        const childrenAndOwn = this.findChildrenAndOwnNode(item)
        this.toggleSelection(childrenAndOwn, condition)
      })
      !this.checkStrictly && this.$emit('select-all', this.selection)
    },
    // 手动勾选数据行的 Checkbox 时触发的事件
    select(selection, row) {
      const { tableData } = this.tableForm
      this.selection = selection
      // 勾选子元素, 所有子元素
      const condition = selection.includes(row)
      const childrenAndOwn = this.findChildrenAndOwnNode(row)
      this.toggleSelection(childrenAndOwn, condition)
      // 判断父元素是否取消勾选， 循环往上找父元素
      let parent = this.findParentNode(tableData, row)
      while (parent) {
        const children = parent[this.childrenKey]
        const isAllChecked = children.every((item) => selection.includes(item))
        this.toggleSelection([parent], isAllChecked)
        parent = this.findParentNode(tableData, parent)
      }
      !this.checkStrictly && this.$emit('select', this.selection, row)
    },
    // 迭代找父节点
    findParentNode(dataList, row) {
      const childrenKey = this.childrenKey
      function iterateFn(dataList, row) {
        for (let i = 0; i < dataList.length; i++) {
          const children = dataList[i][childrenKey]
          if (Array.isArray(children) && children.length) {
            if (children.includes(row)) {
              return dataList[i]
            } else {
              const parent = iterateFn(children, row)
              if (parent) return parent
            }
          }
        }
      }
      return iterateFn(dataList, row)
    },
    // 迭代找所有子节点 -- 可包括自己
    findChildrenAndOwnNode(row, hasOwn = true) {
      const childrenKey = this.childrenKey
      const arr = []
      function iterateFn(dataList) {
        dataList.forEach((item) => {
          arr.push(item)
          const children = item[childrenKey]
          if (Array.isArray(children) && children.length) {
            iterateFn(children)
          }
        })
      }
      iterateFn(row.children || [])
      return hasOwn ? arr.concat(row) : arr
    },
    currentChange(currentRow, oldCurrentRow) {
      if (this.showSingleStatus) return
      this.currentRow = currentRow
      this.$emit('current-change', currentRow, oldCurrentRow)
    },
    // 处理工具箱点击事件
    happenUtilEvent(util) {
      const { method } = util
      this[method]()
    },
    // 单条展示
    showSingle() {
      if (
        !Object.keys(this.currentRow).length ||
        this.currentRow.rowType__table === 'searchRow'
      ) {
        this.$message.warning('请先选中一条数据')
        return
      }
      if (!this.showSingleStatus) {
        const { tableData } = this.tableForm
        // temColumns = deepClone(this.columns)
        // temTableData = deepClone(tableData)
        temColumns = this.columns
        temTableData = tableData
        this.tableForm.tableData = this.getSingleTableData(this.currentRow)
        this.columns = []
        this.$nextTick(() => {
          this.columns = singleColunms
        })
        // this.columns = singleColunms
        this.showSingleStatus = true
      } else {
        // this.currentRow = {}
        this.tableForm.tableData = temTableData
        this.columns = temColumns
        this.showSingleStatus = false
      }
    },
    // 获取单条展示数据
    getSingleTableData(row) {
      const arr = []
      this.flatColums.forEach((column) => {
        const { prop, label__table } = column
        const $index = this.flatData.indexOf(row)
        // const $index = flatData.indexOf(row)
        // const $index = 0
        if (prop) {
          arr.push({
            prop,
            propName: label__table,
            propValue: getShowValue(
              row,
              column,
              $index,
              column,
              this.allOptions,
              this.placeholder
            ),
          })
        }
      })
      return arr
    },
    // 列选择工具
    setColumms() {
      this.$refs.filterColumns.dialogVisable = true
    },
    // 下载工具
    download() {
      const { tableData } = this.tableForm
      let hasSelection = false
      function getcolumn(columns) {
        const arr = []
        // const propMap = {}
        columns.forEach((column) => {
          const obj = {}
          if (!column.type) {
            const { label, prop, children } = column
            if (label) obj.title = label
            if (prop) {
              obj.dataIndex = prop
              // propMap[prop] = column
            }
            if (children) obj.children = getcolumn(children)
            arr.push(obj)
          }
          if (column.type === 'selection') hasSelection = true
        })
        return arr
      }
      // 点击导出触发的函数
      const columns = getcolumn(deepClone(this.columns))
      let data = []
      if (hasSelection) {
        const length = this.selection.length
        if (!length) {
          this.$message.warning('请先勾选需要导出的数据')
          return
        }
        data = deepClone(this.selection)
      } else data = treeToFlat(deepClone(tableData))
      this.flatColums.forEach((column) => {
        const { prop } = column
        data.forEach((row, $index) => {
          prop &&
            (row[prop] = getShowValue(
              row,
              column,
              $index,
              column,
              this.allOptions,
              this.placeholder
            ))
        })
      })
      try {
        const ElMapExportTable = require('table-excel').ElMapExportTable
        const instance = new ElMapExportTable(
          { column: columns, data }
          // { progress: (progress) => console.log(progress) } // 进度条回调
        )
        instance.download('表格数据')
      } catch (error) {
        console.log('没有找到包')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.talbe-utils {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
  padding-right: 12px;

  .icon-setting {
    font-size: 20px;
    cursor: pointer;
    margin-right: 8px;
  }
}

.common-table-pagination {
  text-align: right;
  margin: 10px 0;
}

/deep/ .el-input.is-disabled .el-input__inner {
  color: #959090;
}

/deep/ .el-textarea.is-disabled .el-textarea__inner {
  color: #959090;
}

/deep/ .el-input-number {
  width: 100%;
  overflow: hidden;
}

/deep/ .el-select {
  width: 100%;
}

/deep/ .el-date-editor.el-input__inner {
  width: 100%;
}

/deep/ .el-date-editor.el-input {
  width: 100%;
}
/deep/ .el-checkbox-group {
  height: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .el-checkbox {
    margin-right: 10px;
  }
  .el-checkbox:last-child {
    margin-right: 0;
  }
  .el-checkbox__label {
    padding-left: 2px;
  }
}
/deep/ .el-radio-group {
  height: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .el-radio {
    margin-right: 10px;
  }
  .el-radio:last-child {
    margin-right: 0;
  }
  .el-radio__label {
    padding-left: 2px;
  }
}
/deep/ .table-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
}
.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.common-table {
  flex: 1;
  min-height: 0;
}
/deep/ .el-form--inline .el-form-item {
  margin-right: 0;
}
/deep/ .search-cell {
  .cell > .el-checkbox {
    display: none;
  }
  .el-table__expand-icon {
    display: none;
  }
  .el-form-item {
    margin-bottom: 0;
  }
}
/deep/ .tree-cell {
  .overflow_tip {
    display: inline;
  }
}
/deep/ .form-cell {
  .cell {
    padding-left: 2px;
    padding-right: 2px;
  }
  // .el-input:not(.el-date-editor) input {
  //   padding-left: 4px;
  // }
  // .el-select .el-input input {
  //   padding-left: 15px;
  // }
}
/deep/ .formNoMarginBottom {
  .el-form-item {
    margin-bottom: 0;
  }
}
/deep/ .headerWidthForm {
  .el-table__header {
    th.el-table__cell > .cell {
      position: static;
    }
    .el-table__cell {
      padding-bottom: 31px;
    }
    .el-form-item {
      position: absolute;
      bottom: 1px;
      left: 0;
      width: calc(100% - 4px);
      margin: 0 2px 0;
    }
  }
}
</style>
