<template>
  <!-- 有childrens -->
  <!-- 迭代tableColumn组件，实现多级表头 -->
  <el-table-column :label="fieldItem.label" v-if="fieldItem.childrens">
    <tableColumn
      v-for="(column, index) in fieldItem.childrens"
      :key="index"
      :fieldItem="column"
      :rules="rules"
      :globalMinDate="globalMinDate"
      :globalMaxDate="globalMaxDate"
      :allOptions="allOptions"
      @happenEvent="(params) => $emit('happenEvent', params)"
    >
    </tableColumn>
  </el-table-column>
  <!-- 没有有childrens -->
  <el-table-column v-else align="center" resizable v-bind="fieldItem">
    <!-- 表头插槽 -->
    <template v-slot:header="scope">
      <slot
        :name="fieldItem.headerSlotName"
        v-bind="{ ...scope, fieldItem }"
        v-if="fieldItem.headerSlotName"
      >
        {{ fieldItem.label }}
      </slot>
      <template v-else>
        {{ fieldItem.label }}
        <i style="color: #f56c6c" v-if="fieldItem.required">*</i>
      </template>
    </template>
    <!-- 内容插槽 -->
    <template v-slot="{ row, column, $index }">
      <!-- 判断是否是el-form-item元素 -->
      <component
        :is="fieldItem.required ? 'el-form-item' : 'div'"
        :class="{ overflow_tip: fieldItem['show-overflow-tooltip'] }"
        :prop="`tableData.${$index}.${fieldItem.prop}`"
        :rules="getRules(fieldItem, row)"
      >
        <!-- 命名插槽 -->
        <template v-if="fieldItem.slotName">
          <slot
            :name="fieldItem.slotName"
            v-bind="{ row, column, $index, fieldItem }"
          >
            {{ row[fieldItem.prop] }}
          </slot>
        </template>
        <!-- 输入框模式 allowToggle控制是否能够双击切换-->
        <template
          v-else-if="
            fieldItem.component === 'el-input' && fieldItem.allowToggle
          "
        >
          <div
            style="min-height: 23px"
            v-if="!(property === fieldItem.prop && index === $index)"
            @dblclick="toggleInput(row, column, $index)"
          >
            {{ row[fieldItem.prop] }}
          </div>
          <component
            v-else
            size="mini"
            :is="fieldItem.component"
            :disabled="row[fieldItem.disabledKey]"
            v-bind="getAttrs(fieldItem, row, globalMinDate, globalMaxDate)"
            v-focus
            :value="row[fieldItem.prop]"
            @change="fieldItemChange(fieldItem, row)"
            @blur="handleBlur(row, fieldItem)"
            @input="handleInput($event, row, fieldItem)"
          >
          </component>
        </template>
        <!-- 表单元素模式 -->
        <component
          v-if="fieldItem.component"
          size="mini"
          :is="fieldItem.component"
          :disabled="row[fieldItem.disabledKey]"
          v-bind="getAttrs(fieldItem, row, globalMinDate, globalMaxDate)"
          v-model="row[fieldItem.prop]"
          @change="fieldItemChange(fieldItem, row)"
        >
          <template v-if="fieldItem.component === 'el-select'">
            <el-option
              v-for="item in allOptions[fieldItem.prop]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </template>
        </component>
        <!-- 格式化 -->
        <template v-else-if="fieldItem.formatter">{{
          fieldItem.formatter(row, column, row[fieldItem.prop], $index)
        }}</template>
        <!-- 默认 -->
        <template v-else>{{ row[fieldItem.prop] }}</template>
      </component>
    </template>
  </el-table-column>
</template>

<script>
import { deepClone, getPicker, getAttrs } from '../../utils/util'
export default {
  name: 'tableColumn',
  props: {
    fieldItem: {
      default() {
        return {}
      },
      type: Object
    },
    rules: {
      default() {
        return {}
      },
      type: Object
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
    },
    // 下拉框选项配置数组
    allOptions: {
      default() {
        return {}
      },
      type: Object
    }
  },
  data() {
    return {
      temRow: {}
    }
  },
  methods: {
    getPicker,
    getAttrs,
    // 动态获取校验
    getRules(fieldItem, row) {
      if (!fieldItem.required) return
      let rules = deepClone(this.rules[fieldItem.prop])
      if (
        fieldItem.component === 'el-date-picker' ||
        fieldItem.component === 'el-time-select'
      ) {
        const params = fieldItem
        if (params.minTime && !row[fieldItem.disabledKey]) {
          const minField = params.minTime
          rules.push({
            validator: (rule, value, callback) => {
              if (+new Date(value) < +new Date(row[minField])) {
                callback(new Error('请注意时间先后'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          })
        }
        if (params.maxTime && !row[fieldItem.disabledKey]) {
          const maxField = params.maxTime
          rules.push({
            validator: (rule, value, callback) => {
              if (+new Date(value) > +new Date(row[maxField])) {
                callback(new Error('请注意时间先后'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          })
        }
      }
      return rules
    },
    // 点击切换input 框
    toggleInput(row, column, $index) {
      this.index = $index
      this.property = column.property
      this.temRow = deepClone(row)
    },
    // input框失焦处理
    handleBlur(row, fieldItem) {
      const { prop, blurHandler: handler } = fieldItem
      this.index = ''
      this.property = ''
      // 如果前后值相同则不处理
      if (row[prop] == this.temRow[prop]) {
        return
      }
      // 自定义数据过滤
      if (typeof handler === 'function') {
        const newValue = handler(row[prop])
        row[prop] = newValue
      }
      this.fieldItemChange(fieldItem, row)
    },
    // input框输入处理
    handleInput(value, row, fieldItem) {
      const { prop, inputHandler: handler } = fieldItem
      if (typeof handler === 'function') {
        const newValue = handler(value)
        row[prop] = newValue
      } else {
        row[prop] = value
      }
    },
    // 表格内复选框变更
    fieldItemChange(fieldItem, row) {
      this.$emit('happenEvent', {
        method: 'fieldItemChange',
        fieldItem,
        row
      })
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-table tr input[type='checkbox'] {
  cursor: pointer;
}
.overflow_tip {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
