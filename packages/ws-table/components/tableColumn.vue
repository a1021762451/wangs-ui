<template>
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
  <el-table-column
    v-else
    align="center"
    :prop="fieldItem.field"
    :label="fieldItem.label"
    :width="fieldItem.width"
    :fixed="fieldItem.fixed"
    :show-overflow-tooltip="fieldItem.showTooltip"
  >
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
    <template v-slot="{ row, column, $index }">
      <component
        :is="fieldItem.required ? 'el-form-item' : 'div'"
        :prop="`tableData.${$index}.${fieldItem.field}`"
        :rules="getRules(fieldItem, row)"
      >
        <template v-if="fieldItem.slotName">
          <slot
            :name="fieldItem.slotName"
            v-bind="{ row, column, $index, fieldItem }"
          >
            {{ row[fieldItem.field] }}
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
            v-if="!(property === fieldItem.field && index === $index)"
            @dblclick="toggleInput(row, column, $index)"
          >
            {{ row[fieldItem.field] }}
          </div>
          <template v-else>
            <el-input
              v-if="fieldItem.allowToggle"
              size="mini"
              v-focus
              :value="row[fieldItem.field]"
              @blur="handleBlur(row, fieldItem)"
              @input="handleInput($event, row, fieldItem)"
            ></el-input>
          </template>
        </template>
        <component
          v-if="fieldItem.component"
          size="mini"
          :is="fieldItem.component"
          :disabled="row[fieldItem.disabledKey]"
          v-bind="getAttrs(fieldItem, row, globalMinDate, globalMaxDate)"
          v-model="row[fieldItem.field]"
          @change="fieldItemChange(fieldItem, row)"
        >
          <template v-if="fieldItem.component === 'el-select'">
            <el-option
              v-for="item in allOptions[fieldItem.field]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </template>
        </component>
        <template v-else-if="fieldItem.formatter">{{
          fieldItem.formatter(row[fieldItem.field], row, column, $index)
        }}</template>
        <template v-else>{{ row[fieldItem.field] }}</template>
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
      let rules = deepClone(this.rules[fieldItem.field])
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
      this.fieldItemChange(fieldItem, row)
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
    fieldItemChange(fieldItem, row) {
      this.$emit('happenEvent', {
        buttonItem: { method: 'fieldItemChange', fieldItem },
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
</style>
