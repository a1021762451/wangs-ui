<template>
  <div>
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
      style="height: calc(100% - 35px)"
    >
      <!-- 表格 -->
      <el-table
        border
        tooltip-effect="dark"
        style="width: 100%"
        height="100%"
        :header-cell-style="{ background: '#f3f3f3' }"
        :data="tableForm.tableData"
        v-loading="loading"
        v-bind="$attrs"
        v-on="$listeners"
      >
        <template v-for="fieldItem in columns">
          <!-- 特殊列，如复选框，序号列 -->
          <el-table-column
            width="55"
            align="center"
            v-if="fieldItem.type"
            v-bind="fieldItem"
            :key="fieldItem.type"
          >
            <template v-if="fieldItem.slotName" v-slot="scope">
              <slot :name="fieldItem.slotName" v-bind="{ ...scope, fieldItem }">
              </slot>
            </template>
          </el-table-column>
          <!-- 内容列 -->
          <tableColumn
            v-else
            :key="fieldItem.prop"
            :fieldItem="fieldItem"
            :rules="rules"
            :allOptions="allOptions"
            @happenEvent="(params) => $emit('happenEvent', params)"
          >
          </tableColumn>
        </template>
        <!-- 操作列 -->
        <el-table-column
          v-if="tableButtons.length"
          align="center"
          key="operation"
          v-bind="operationColumn"
          :width="tableButtons.length * 70"
        >
          <template v-slot="{ row, column, $index }">
            <ws-buttons
              isLinkButton
              :buttonConfigList="filterButtons(row, tableButtons)"
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
  </div>
</template>

<script>
import { deepClone } from '../utils/util'
import wsButtons from '../componentes/ws-buttons.vue'
import tableColumn from './components/tableColumn'
export default {
  name: 'ws-table',
  components: { wsButtons, tableColumn },
  props: {
    // 必传,
    // 表格列
    tableColumns: {
      default() {
        return []
      },
      type: Array
    },
    // 表格数据
    tableData: {
      default() {
        return []
      },
      type: Array
    },
    // 非必传
    // 表格按钮
    tableButtons: {
      default() {
        return []
      },
      type: Array
    },
    // 过滤表格操作按钮
    filterButtons: {
      default(row, tableButtons) {
        return tableButtons
      },
      type: Function
    },
    // 默认分页配置
    defaultPageInfo: {
      default() {
        return {
          size: 10,
          current: 1,
          total: 0
        }
      },
      type: Object
    },
    // 展示分页组件
    showPagination: {
      type: Boolean,
      default: true
    },
    operationColumn: {
      default() {
        return {
          label: '操作',
          fixed: 'right'
        }
      },
      type: Object
    },
    // 加载样式
    loading: {
      type: Boolean,
      default: false
    },
    // 下拉框选项配置数组
    allOptions: {
      default() {
        return {}
      },
      type: Object
    }
  },
  //自定义指令
  directives: {
    focus: {
      inserted: function (el) {
        el.querySelector('input').focus()
      }
    }
  },
  data() {
    return {
      columns: deepClone(this.tableColumns), // 列数据
      pageInfo: this.defaultPageInfo, // 分页数据
      // 用于表格input组件
      property: '',
      index: '',
      tableForm: {
        tableData: []
      }
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
      immediate: true
    }
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
              trigger: blurEletypes.includes(item.component) ? 'blur' : 'change'
            }
          ]
        }
      })
      return obj
    }
  },
  // created() {
  //   this.handleSearch()
  // },
  methods: {
    // 监听转发事件
    async happenEvent(buttonItem, { row, column, $index }) {
      // const valid = await this.validateRow($index)
      // const valid = await this.validateAll()
      // console.log('xxxxxxxxxxxxxxx', valid)
      this.$emit('happenEvent', {
        ...buttonItem,
        row
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
        method: 'pageChange',
        pageInfo: this.pageInfo,
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
    }
  }
}
</script>

<style lang="less" scoped>
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
