<template>
  <div class="table-container">
    <ws-form
      v-if="showSearch"
      @update:formData="
        (params) => {
          $emit('update:searchData', params)
        }
      "
      @happenEvent="happenEvent"
      style="margin-bottom: 10px"
      v-bind="{
        formData: searchData,
        isSearchList: true,
        ...seachConfig,
      }"
    >
      <!-- 将父组件插槽内容转发给子组件 -->
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
        <slot :name="name" v-bind="scope"></slot>
      </template>
    </ws-form>
    <!-- 工具箱 -->
    <div class="talbe-utils" v-if="utilsList.length">
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
      @happenEvent="(buttonItem) => $emit('happenEvent', { buttonItem })"
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
      :is="
        columns.some((item) => {
          return item.component
        })
          ? 'el-form'
          : 'div'
      "
      :model="tableForm"
      ref="tableForm"
      label-width="80px"
      :validate-on-rule-change="false"
      inline
      size="small"
      class="common-table"
    >
      <!-- 表格 -->
      <el-table
        style="width: 100%"
        :data="tableForm.tableData"
        v-loading="loading"
        v-bind="{
          rowKey,
          stripe: true,
          border: true,
          height: '100%',
          ...$attrs,
        }"
        @select="select"
        @select-all="selectAll"
        @selection-change="selectionChange"
        v-on="{
          ...$listeners,
          ...(!checkStrictly
            ? {
                select: () => {},
                'select-all': () => {},
                'selection-change': () => {},
              }
            : {}),
        }"
        ref="table"
      >
        <!-- 列遍历， 可实现嵌套 -->
        <tableColumn
          v-for="fieldItem in columns"
          :key="fieldItem.label + fieldItem.prop + fieldItem.type"
          :fieldItem="fieldItem"
          :rules="rules"
          :allOptions="allOptions"
          :filterButtons="filterButtons"
          :placeholder="placeholder"
          :switchConfig="switchConfig"
          @happenEvent="happenEvent"
        >
          <!-- 将父组件插槽内容转发给子组件 -->
          <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
            <slot :name="name" v-bind="scope"></slot>
          </template>
        </tableColumn>
      </el-table>
    </component>
    <!-- 分页 -->
    <el-pagination
      v-if="showPagination"
      class="common-table-pagination"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pageInfo.current"
      :page-sizes="[10, 20, 50, 100]"
      :page-size.sync="pageInfo.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageInfo.total"
    ></el-pagination>
    <!-- 列展示选择 -->
    <!-- <filterColumns
      v-if="utilsList.includes('setColumms')"
      :tableColumns="tableColumns"
      :columns="columns"
      @filterColumnsConfirm="filterColumnsConfirm"
      ref="filterColumns"
    ></filterColumns> -->
  </div>
</template>

<script>
import { debounce, deepClone } from '../utils/util'
import { allUtils } from './contant.js'
import mixins from './mixins'
import wsButtons from '../ws-buttons/index.vue'
import tableColumn from './components/tableColumn'
import wsForm from '../ws-form/index.vue'
export default {
  name: 'ws-table',
  mixins: [mixins],
  components: {
    wsButtons,
    tableColumn,
    // filterColumns: () => import('./components/filterColumns'),
    wsForm,
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
      type: Array,
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
    // 过滤表格操作按钮
    filterButtons: {
      default(row, buttonConfigList) {
        return buttonConfigList
      },
      type: Function,
    },
    // 搜索框配置
    seachConfig: {
      default() {
        return {}
      },
      type: Object,
    },
    // 搜索框数据
    searchData: {
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
    // 编辑配置
    switchConfig: {
      default() {
        return {
          // switchMode: '', // dblclick/rowControl
          // switchKey: 'isEdit__table', // 切换键
        }
      },
      type: Object,
    },
  },
  data() {
    return {
      columns: [], // 列数据
      cloneColunms: [], // 复制列数据，用于列筛选
      // 用于el-from模式
      tableForm: {
        tableData: [],
      },
      tableData: [],
      filterColumnsVisable: false, // 列勾选弹窗
      selection: [],
      selectionChange: debounce(this.selectionChangeCallback, 100),
    }
  },
  watch: {
    tableColumns: {
      handler(newData) {
        this.columns = deepClone(newData)
        this.cloneColunms = deepClone(newData)
      },
      immediate: true,
    },
    // 列表变更更新表单布局
    columns: {
      handler() {
        this.$nextTick(() => {
          this.doLayout()
        })
      },
    },
    data: {
      handler(newData) {
        this.tableData = newData
        this.tableForm.tableData = newData
        // 表格数据增加prop, 便于校验表单
        this.addFormPropForTable()
        // 配置selfAdjust为true,则宽度自调节
        this.getDynamicWidth(this.columns)
      },
      immediate: true,
    },
  },
  computed: {
    rules() {
      let obj = {}
      const blurEletypes = ['el-input', 'el-input-number']
      this.columns.forEach((item) => {
        if (item.required && !item.disabled) {
          obj[item.prop] = [
            {
              required: true,
              message: `请输入${item.label}`,
              trigger: 'change',
              // trigger: blurEletypes.includes(item.component)
              //   ? 'blur'
              //   : 'change',
            },
          ]
        }
      })
      return obj
    },
    utils() {
      const utils = deepClone(allUtils)
      return utils.filter((item) => {
        return this.utilsList.includes(item.method)
      })
    },
    treeProps() {
      return this.$attrs['tree-props'] || {}
    },
    childrenKey() {
      return this.treeProps.children || 'children'
    },
    rowKey() {
      return this.$attrs['row-key'] || 'id'
    },
    switchMode() {
      return this.switchConfig.switchMode
    },
    switchKey() {
      return this.switchConfig.switchKey || 'isEdit__table'
    },
  },
  mounted() {
    window.addEventListener('resize', this.doLayout)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.doLayout)
  },
  methods: {
    // 迭代增加prop
    addFormPropForTable() {
      const childrenKey = this.childrenKey
      const iterateAddProp = (data, childrenKey, prop__table) => {
        data.forEach((item, index) => {
          item.prop__table = `${prop__table}.${index}`
          // 编辑模式下，增加切换键
          this.switchMode === 'rowControl' &&
            item[this.switchKey] === undefined &&
            this.$set(item, this.switchKey, false)
          if (item.children) {
            iterateAddProp(
              item.children,
              childrenKey,
              `${prop__table}.${index}.${childrenKey}`
            )
          }
        })
      }
      iterateAddProp(this.tableData, childrenKey, 'tableData')
    },
    // 遍历获取动态宽度
    getDynamicWidth(columns) {
      const childrenKey = this.childrenKey
      columns.forEach((column) => {
        const conditon = column.selfAdjust
        if (conditon) {
          const arr = this.getColumnData(this.tableData, column, childrenKey)
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
        buttonItem: { method: 'search' },
      })
    },
    happenEvent(params) {
      if (params.buttonItem.method === 'search')
        this.$emit('update:pageInfo', { ...this.pageInfo, current: 1 })
      this.$emit('happenEvent', params)
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
    validateRow(row) {
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
        this.columns = this.iterateColumns(deepClone(this.cloneColunms), values)
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
    // 勾选操作
    selectionChangeCallback(selection) {
      !this.checkStrictly && this.$emit('selection-change', this.selection)
    },
    // 全选
    selectAll(selection) {
      this.tableData.forEach((item) => {
        const condition = selection.includes(item)
        const childrenAndOwn = this.findChildrenAndOwnNode(item)
        this.toggleSelection(childrenAndOwn, condition)
      })
      !this.checkStrictly && this.$emit('select-all', this.selection)
    },
    // 手动勾选数据行的 Checkbox 时触发的事件
    select(selection, row) {
      this.selection = selection
      // 勾选子元素, 所有子元素
      const condition = selection.includes(row)
      const childrenAndOwn = this.findChildrenAndOwnNode(row)
      this.toggleSelection(childrenAndOwn, condition)
      // 判断父元素是否取消勾选， 循环往上找父元素
      let parent = this.findParentNode(this.tableData, row)
      while (parent) {
        const children = parent[this.childrenKey]
        const isAllChecked = children.every((item) => selection.includes(item))
        this.toggleSelection([parent], isAllChecked)
        parent = this.findParentNode(this.tableData, parent)
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
    // 处理工具箱点击事件
    happenUtilEvent(util) {
      const { method } = util
      this[method]()
    },
    // 列选择工具
    setColumms() {
      this.$refs.filterColumns.dialogVisable = true
    },
    // 下载工具
    download() {
      const formatterArr = []
      let hasSelection = false
      function getcolumn(column) {
        const arr = []
        // const propMap = {}
        column.forEach((item) => {
          const obj = {}
          if (!item.type) {
            const { label, prop, children, formatter } = item
            if (label) obj.title = label
            if (prop) {
              obj.dataIndex = prop
              // propMap[prop] = item
            }
            if (formatter) formatterArr.push(item)
            if (children) obj.children = getcolumn(children)

            arr.push(obj)
          }
          if (item.type === 'selection') hasSelection = true
        })
        return arr
      }
      // 点击导出触发的函数
      const column = getcolumn(deepClone(this.columns))
      let data = []
      if (hasSelection) {
        const length = this.selection.length
        if (!length) {
          this.$message.warning('请先勾选需要导出的数据')
          return
        }
        data = this.selection
      } else data = deepClone(this.tableData)
      data.forEach((item) => {
        formatterArr.forEach(({ prop, formatter }) => {
          item[prop] = formatter(item[prop])
        })
      })
      try {
        const ElMapExportTable = require('table-excel').ElMapExportTable
        const instance = new ElMapExportTable(
          { column, data }
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
  margin-bottom: 10px;
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
/deep/ .table-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
}
.table-container {
  display: flex;
  flex-direction: column;
}

.common-table {
  flex: 1;
  min-height: 0;
}
</style>
