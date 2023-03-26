<template>
  <div>
    <div class="talbe-utils" v-if="utilsList.length">
      <!-- <el-button
        type="primary"
        size="mini"
        @click="$refs.filterColumns.dialogVisable = true"
        >列勾选</el-button
      > -->
      <el-tooltip
        content="列设置"
        placement="top"
        v-if="utilsList.includes('setColumms')"
      >
        <i
          class="el-icon-setting icon-setting"
          @click="$refs.filterColumns.dialogVisable = true"
        ></i>
      </el-tooltip>
    </div>
    <!-- 表格 -->
    <component
      :is="
        columns.some((item) => {
          return item.required
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
      :style="{
        height: showPagination ? 'calc(100% - 35px)' : 'calc(100%)',
      }"
    >
      <!-- 表格 -->
      <el-table
        border
        tooltip-effect="dark"
        style="width: 100%"
        height="100%"
        :data="tableForm.tableData"
        v-loading="loading"
        v-bind="$attrs"
        v-on="$listeners"
        ref="el-table"
      >
        <template v-for="fieldItem in columns">
          <!-- 操作列 -->
          <el-table-column
            v-if="fieldItem.type === 'operation' && fieldItem.visible"
            align="center"
            :width="(fieldItem.tableButtons || []).length * 70"
            label="操作"
            fixed="right"
            v-bind="fieldItem"
            :key="fieldItem.type"
          >
            <template v-slot="{ row, column, $index }">
              <ws-buttons
                isLinkButton
                :buttonConfigList="
                  filterButtons(row, fieldItem.tableButtons || [])
                "
                @happenEvent="happenEvent($event, { row, column, $index })"
              >
                <template
                  v-for="(index, name) in $scopedSlots"
                  v-slot:[name]="scope"
                >
                  <slot :name="name" v-bind="scope"></slot>
                </template>
              </ws-buttons>
            </template>
          </el-table-column>
          <!-- 特殊列，如复选框，序号列 -->
          <el-table-column
            width="55"
            align="center"
            v-else-if="fieldItem.type && fieldItem.visible"
            v-bind="fieldItem"
            :key="fieldItem.type + 'special'"
          >
            <template v-if="fieldItem.slotName" v-slot="scope">
              <slot :name="fieldItem.slotName" v-bind="{ ...scope, fieldItem }">
              </slot>
            </template>
          </el-table-column>
          <!-- 内容列 -->
          <tableColumn
            v-else-if="!fieldItem.type"
            :key="fieldItem.prop || fieldItem.label"
            :fieldItem="fieldItem"
            :rules="rules"
            :allOptions="allOptions"
            @happenEvent="(params) => $emit('happenEvent', params)"
          >
          </tableColumn>
        </template>
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
    <filterColumns
      v-if="utilsList.includes('setColumms')"
      :tableColumns="tableColumns"
      :columns="columns"
      @filterColumnsConfirm="filterColumnsConfirm"
      ref="filterColumns"
    ></filterColumns>
  </div>
</template>

<script>
import { deepClone } from '../utils/util'
import wsButtons from '../ws-buttons/index.vue'
import tableColumn from './components/tableColumn'
import filterColumns from './components/filterColumns'
export default {
  name: 'ws-table',
  components: { wsButtons, tableColumn, filterColumns },
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
    tableData: {
      default() {
        return []
      },
      type: Array,
    },
    // 过滤表格操作按钮
    filterButtons: {
      default(row, tableButtons) {
        return tableButtons
      },
      type: Function,
    },
    // 默认分页配置
    defaultPageInfo: {
      default() {
        return {
          size: 10,
          current: 1,
          total: 0,
        }
      },
      type: Object,
    },
    // 展示分页组件
    showPagination: {
      type: Boolean,
      default: true,
    },
    operationColumn: {
      default() {
        return {
          label: '操作',
          fixed: 'right',
        }
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
  },
  //自定义指令
  directives: {
    focus: {
      inserted: function (el) {
        el.querySelector('input').focus()
      },
    },
  },
  data() {
    return {
      columns: [], // 列数据
      cloneColunms: [], // 复制列数据，用于列筛选
      pageInfo: this.defaultPageInfo, // 分页数据
      // 用于表格input组件
      property: '',
      index: '',
      tableForm: {
        tableData: [],
      },
      filterColumnsVisable: false, // 列勾选弹窗
    }
  },
  watch: {
    tableData: {
      handler(newData) {
        // 配置selfAdjust为true,则宽度自调节
        this.columns.forEach((column) => {
          const arr = newData.map((x) => x[column.prop]) // 获取每一列的所有数据
          arr.push(column.label) // 把每列的表头也加进去算
          const conditon = column.selfAdjust
          if (conditon) this.$set(column, 'width', this.getMaxLength(arr) + 40)
        })
        this.tableForm.tableData = this.tableData
      },
      immediate: true,
    },
    tableColumns: {
      handler(newData) {
        const columns = deepClone(newData)
        this.iterateAddVisible(columns)
        this.columns = columns
        this.cloneColunms = deepClone(this.columns)
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
  },
  methods: {
    // 监听转发事件
    async happenEvent(buttonItem, { row, column, $index }) {
      // const valid = await this.validateRow($index)
      // const valid = await this.validateAll()
      // console.log('xxxxxxxxxxxxxxx', valid)
      this.$emit('happenEvent', {
        buttonItem,
        row,
      })
    },
    // 分页操作
    handleCurrentChange(val) {
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.pageInfo.current = 1
      this.handleSearch()
    },
    handleSearch() {
      this.$emit('happenEvent', {
        buttonItem: { method: 'pageChange' },
        pageInfo: this.pageInfo,
      })
    },
    // 迭代添加visible属性
    iterateAddVisible(columns) {
      columns.forEach((item) => {
        if (item.children) this.iterateAddVisible(item.children)
        else item.visible = true
      })
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
    validateRow(index) {
      const props = []
      let allpromise = []
      for (let key in this.rules) {
        props.push(`tableData.${index}.${key}`)
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
    // // 列勾选确认
    // filterColumnsConfirm(values) {
    //   this.$set(this, 'columns', [])
    //   this.$nextTick(() => {
    //     this.$set(
    //       this,
    //       'columns',
    //       this.iterateColumns(deepClone(this.cloneColunms), values)
    //     )
    //   })
    //   this.$refs.filterColumns.dialogVisable = false
    // },
    // // 迭代确认勾选列
    // iterateColumns(dataList, values) {
    //   const arr = []
    //   dataList.forEach((item) => {
    //     const { type, prop, children } = item
    //     if (children) {
    //       const newChildrens = this.iterateColumns(children, values)
    //       if (newChildrens.length) {
    //         item.children = newChildrens
    //         arr.push(item)
    //       }
    //       return
    //     }
    //     if (type) {
    //       const newType = `type_${type}`
    //       if (values.includes(newType)) arr.push(item)
    //       return
    //     }
    //     if (prop) {
    //       if (values.includes(prop)) arr.push(item)
    //       return
    //     }
    //   })
    //   return arr
    // },
    // 列勾选确认
    filterColumnsConfirm(values) {
      this.iterateColumns(this.columns, values)
      this.$refs.filterColumns.dialogVisable = false
    },
    // 迭代确认勾选列
    iterateColumns(dataList, values) {
      const arr = []
      dataList.forEach((item) => {
        const { type, prop, children } = item
        if (children) {
          this.iterateColumns(children, values)
          return
        }
        if (type) {
          const newType = `type_${type}`
          item.visible = values.includes(newType)
          return
        }
        if (prop) {
          item.visible = values.includes(prop)
          return
        }
      })
      return arr
    },
  },
}
</script>

<style lang="less" scoped>
.talbe-utils {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  padding-right: 20px;
  .icon-setting {
    font-size: 20px;
    cursor: pointer;
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
</style>
