<template>
  <div>
    <!-- 表格 -->
    <el-table
      border
      tooltip-effect="dark"
      style="width: 100%"
      height="calc(100% - 35px)"
      :header-cell-style="{ background: '#f3f3f3' }"
      :data="tableData"
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
          :type="fieldItem.type"
          :label="fieldItem.label"
          :key="fieldItem.type"
        >
          <template v-if="fieldItem.slotName" v-slot="scope">
            <slot :name="fieldItem.slotName" v-bind="{ ...scope, fieldItem }">
            </slot>
          </template>
        </el-table-column>
        <!-- 内容列 -->
        <el-table-column
          :key="fieldItem.field"
          align="center"
          :prop="fieldItem.field"
          :label="fieldItem.label"
          :width="fieldItem.width"
          :fixed="fieldItem.fixed"
          :show-overflow-tooltip="fieldItem.showTooltip"
          v-else
        >
          <template v-if="fieldItem.headerSlotName" v-slot:header="scope">
            <slot
              :name="fieldItem.headerSlotName"
              v-bind="{ ...scope, fieldItem }"
            >
              {{ fieldItem.label }}
            </slot>
          </template>
          <template v-slot="{ row, column, $index }">
            <template v-if="fieldItem.slotName">
              <slot
                :name="fieldItem.slotName"
                v-bind="{ row, column, $index, fieldItem }"
              >
                {{ row[fieldItem.field] }}
              </slot>
            </template>
            <!-- 输入框模式 -->
            <template v-else-if="fieldItem.eleType === 'input'">
              <el-input
                size="mini"
                v-focus
                v-if="property === fieldItem.field && index === $index"
                :value="row[fieldItem.field]"
                @blur="handleBlur(row, fieldItem)"
                @input="handleInput($event, row, fieldItem)"
              ></el-input>
              <div
                style="min-height: 23px"
                v-else
                @dblclick="toggleInput(row, column, $index)"
              >
                {{ row[fieldItem.field] }}
              </div>
            </template>
            <!-- 复选框模式 -->
            <input
              v-else-if="fieldItem.eleType === 'checkBox'"
              style="cursor: pointer"
              type="checkbox"
              true-value="1"
              false-value="0"
              :disabled="
                row[fieldItem.field] !== '1' && row[fieldItem.field] !== '0'
              "
              v-model="row[fieldItem.field]"
              @change="checkBoxChange($event, fieldItem, row)"
            />
            <!-- 下拉框模式 -->
            <el-select
              v-else-if="fieldItem.eleType === 'select'"
              size="mini"
              v-model="row[fieldItem.field]"
              placeholder="请选择"
              filterable
              clearable
              @change="selectChange($event, fieldItem, row)"
            >
              <el-option
                v-for="fieldItem in fieldItem.options"
                :key="fieldItem.value"
                :label="fieldItem.label"
                :value="fieldItem.value"
              >
              </el-option>
            </el-select>
            <!-- 时间框模式 -->
            <el-date-picker
              v-else-if="
                fieldItem.eleType === 'datetime' &&
                judgeTimeType(fieldItem.valueFormat) !== 'time'
              "
              size="mini"
              clearable
              v-model="row[fieldItem.field]"
              :type="judgeTimeType(fieldItem.valueFormat)"
              :value-format="fieldItem.valueFormat"
              :placeholder="row[fieldItem.disabledKey] ? '' : '选择时间'"
              :disabled="row[fieldItem.disabledKey]"
              :picker-options="
                getPicker(fieldItem, row, globalMinDate, globalMaxDate)
              "
              @change="datetimeChange($event, fieldItem, row)"
            ></el-date-picker>
            <el-time-select
              size="mini"
              v-else-if="
                fieldItem.eleType === 'datetime' &&
                judgeTimeType(fieldItem.valueFormat) === 'time'
              "
              clearable
              v-model="row[fieldItem.field]"
              :placeholder="row[fieldItem.disabledKey] ? '' : '选择时间'"
              :disabled="row[fieldItem.disabledKey]"
              :picker-options="
                getPicker(fieldItem, row, globalMinDate, globalMaxDate)
              "
              @change="datetimeChange($event, fieldItem, row)"
            ></el-time-select>
            <template v-else-if="fieldItem.formatter">{{
              fieldItem.formatter(row[fieldItem.field], row, column, $index)
            }}</template>
            <template v-else>{{ row[fieldItem.field] }}</template>
          </template>
        </el-table-column>
      </template>
      <!-- 操作列 -->
      <el-table-column
        align="center"
        label="操作"
        key="operation"
        :fixed="operationFixed ? 'right' : undefined"
        :width="tableButtons.length * 70"
        v-if="tableButtons.length"
      >
        <template v-slot="{ row }">
          <ws-buttons
            isLinkButton
            :buttonConfigList="filterButtons(row, tableButtons)"
            @happenEvent="happenEvent($event, row)"
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
import { deepClone, judgeTimeType, getPicker } from '../utils/util'
import wsButtons from '../componentes/ws-buttons.vue'
export default {
  name: 'ws-table',
  components: { wsButtons },
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
    // 操作列是否固定
    operationFixed: {
      type: Boolean,
      default: true
    },
    // 加载样式
    loading: {
      type: Boolean,
      default: false
    },
    // 全局最小时间
    globalMinDate: {
      default: 0,
      type: String | Number
    },
    // 全局最大时间
    globalMaxDate: {
      default: 0,
      type: String | Number
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
      temRow: {},
      property: '',
      index: ''
    }
  },
  watch: {
    // 监听tableData变化， 并按条件自适应表格宽度，固定表头等
    tableData(newData) {
      // 配置selfAdjust为true,则宽度自调节
      this.columns.forEach((column) => {
        const arr = newData.map((x) => x[column.field]) // 获取每一列的所有数据
        arr.push(column.label) // 把每列的表头也加进去算
        const conditon = column.selfAdjust
        if (conditon) this.$set(column, 'width', this.getMaxLength(arr) + 40)
      })
    }
  },
  created() {
    // 处理tableColumns
    // this.tableColumns.forEach(fieldItem => {
    //   // 过滤器进行绑定vue实例
    //   if(fieldItem.formatter) {
    //     fieldItem.formatter = fieldItem.formatter.bind(this)
    //   }
    // })
  },
  methods: {
    judgeTimeType,
    getPicker,
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
        buttonItem: { method: 'handleSearch' }
      })
    },
    // 监听转发事件
    happenEvent(buttonItem, row) {
      this.$emit('happenEvent', {
        buttonItem,
        row
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
    // 点击切换input 框
    toggleInput(row, column, $index) {
      this.index = $index
      this.property = column.property
      this.temRow = deepClone(row)
    },
    // input框失焦处理
    handleBlur(row, fieldItem) {
      const { field, blurHandler: handler } = fieldItem
      this.index = ''
      this.property = ''
      // 如果前后值相同则不处理
      if (row[field] == this.temRow[field]) {
        return
      }
      // 自定义数据过滤
      if (typeof handler === 'function') {
        const newValue = handler(row[field])
        row[field] = newValue
      }
      this.$emit('happenEvent', {
        buttonItem: { method: 'inputChange', field },
        row
      })
    },
    // input框输入处理
    handleInput(value, row, fieldItem) {
      const { field, inputHandler: handler } = fieldItem
      if (typeof handler === 'function') {
        const newValue = handler(value)
        row[field] = newValue
      } else {
        row[field] = value
      }
    },
    // 表格内复选框变更
    checkBoxChange(value, fieldItem, row) {
      this.$emit('happenEvent', {
        buttonItem: { method: 'checkBoxChange', fieldItem },
        row
      })
    },
    // 表格内下拉框变更
    selectChange(value, fieldItem, row) {
      this.$emit('happenEvent', {
        buttonItem: { method: 'selectChange', fieldItem },
        row
      })
    },
    // 表格内时间变更
    datetimeChange(value, fieldItem, row) {
      this.$emit('happenEvent', {
        buttonItem: { method: 'datetimeChange', fieldItem },
        row
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
