<template>
  <!-- 有childrens -->
  <!-- 迭代tableColumn组件，实现多级表头 -->
  <el-table-column
    v-if="fieldItem.children"
    v-bind="{
      align: 'center',
      resizable: true,
      ...fieldItem,
    }"
  >
    <tableColumn
      v-for="column in fieldItem.children"
      :key="column.label + column.prop"
      v-bind="{
        ...$props,
        fieldItem: column,
      }"
      v-on="$listeners"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
        <slot :name="name" v-bind="scope"></slot>
      </template>
    </tableColumn>
  </el-table-column>
  <!-- 没有有childrens -->
  <!-- 操作列 -->
  <el-table-column
    v-else-if="fieldItem.type === 'operation'"
    v-bind="{
      label: '操作',
      fixed: 'right',
      align: 'center',
      resizable: true,
      width: fieldItem.width || (fieldItem.buttonConfigList || []).length * 55,
      ...fieldItem,
    }"
  >
    <!-- 表头插槽 -->
    <template v-slot:header="scope" v-if="fieldItem.headerSlotName">
      <slot :name="fieldItem.headerSlotName" v-bind="{ ...scope, fieldItem }">
        {{ fieldItem.label || '操作' }}
      </slot>
    </template>
    <template v-slot="{ row, column, $index }">
      <ws-buttons
        @happenEvent="happenEvent($event, { row, column, $index })"
        v-bind="{
          isLinkButton: true,
          ...fieldItem,
          buttonConfigList:
            row.rowType__table === 'searchRow'
              ? []
              : filterButtons(fieldItem.buttonConfigList, row),
          TDConfig: TDConfig,
        }"
      >
        <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
          <slot :name="name" v-bind="{ ...scope, fieldItem }"></slot>
        </template>
      </ws-buttons>
    </template>
  </el-table-column>
  <!-- 拖拽列 -->
  <el-table-column
    v-else-if="fieldItem.type === 'drag'"
    v-bind="{
      align: 'center',
      resizable: true,
      ...fieldItem,
    }"
  >
    <!-- 表头插槽 -->
    <template v-slot:header="scope" v-if="fieldItem.headerSlotName">
      <slot :name="fieldItem.headerSlotName" v-bind="{ ...scope, fieldItem }">
        {{ fieldItem.label }}
      </slot>
    </template>
    <template>
      <i class="el-icon-rank drag-handle"></i>
    </template>
  </el-table-column>
  <!-- 内容列 -->
  <el-table-column
    v-else
    v-bind="{
      align: 'center',
      resizable: true,
      showOverflowTooltip: true,
      ...fieldItem,
    }"
  >
    <!-- 表头插槽 -->
    <template v-slot:header="scope">
      <slot
        :name="fieldItem.headerSlotName"
        v-bind="{ ...scope, fieldItem }"
        v-if="fieldItem.headerSlotName"
      >
      </slot>
      <template v-else>
        {{ fieldItem.label }}
      </template>
      <i style="color: #f56c6c" v-if="fieldItem.required">*</i>
      <!-- 表头搜索 -->
      <ws-form-item
        v-if="fieldItem.component && showSearchHeader"
        :allOptions="allOptions"
        :fieldItem="fieldItem"
        :formData="formData"
        :extraComponents="extraComponents"
        :fieldItemChange="
          (fieldItem, formData) => {
            fieldItemChange(fieldItem, formData, 'search')
          }
        "
      >
        <!-- 将父组件插槽内容转发给子组件 -->
        <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
          <slot :name="name" v-bind="scope"></slot>
        </template>
      </ws-form-item>
    </template>
    <!-- 内容插槽 -->
    <template
      v-slot="{ row, column, $index }"
      v-if="!fieldItem.type || (fieldItem.type && fieldItem.columnSlotName)"
    >
      <!-- 表单元素 -->
      <!-- 表单元素编辑模式 -->
      <ws-form-item
        v-if="judgeShowFormItem(fieldItem, row, column, $index)"
        @blur="handleBlur"
        :prop="
          row.prop__table ? `${row.prop__table}.${fieldItem.prop}` : undefined
        "
        :rules="getRules(fieldItem, row)"
        :allOptions="allOptions"
        :fieldItem="setFieldItem(fieldItem, row, column, $index)"
        :formData="row"
        :fieldItemChange="fieldItemChange"
        :extraComponents="extraComponents"
        :vFocus="
          switchModeData.includes('dblclick') &&
          property === fieldItem.prop &&
          index === $index
        "
      >
        <template
          v-if="fieldItem.controlSlotName"
          v-slot:[fieldItem.controlSlotName]
        >
          <slot
            :name="fieldItem.controlSlotName"
            v-bind="{ row, column, $index, fieldItem }"
          ></slot>
        </template>
      </ws-form-item>
      <!-- 表单元素 非编辑模式 -->
      <template v-else>
        <!-- 命名插槽 -->
        <template
          v-if="
            fieldItem.columnSlotName &&
            (fieldItem.searchRowShowSlot || row.rowType__table !== 'searchRow')
          "
        >
          <slot
            :name="fieldItem.columnSlotName"
            v-bind="{ row, column, $index, fieldItem }"
          >
            <!-- 用了插槽就不会显示默认的内容 -->
          </slot>
        </template>
        <!-- 富文本 -->
        <template v-else-if="fieldItem.rich">
          <div
            class="rich-text"
            v-html="
              getShowValue(
                row,
                column,
                $index,
                fieldItem,
                allOptions,
                placeholder
              )
            "
          ></div>
        </template>
        <!-- 默认 包括了格式化 -->
        <template v-else>{{
          getShowValue(row, column, $index, fieldItem, allOptions, placeholder)
        }}</template>
      </template>
    </template>
  </el-table-column>
</template>

<script>
import {
  deepClone,
  getMaxValidator,
  getMinValidator,
  getRandomId,
  getShowValue,
} from '../../utils/util'
import wsFormItem from '../../ws-form-item/index.vue'
import wsButtons from '../../ws-buttons/index.vue'
export default {
  name: 'tableColumn',
  components: {
    wsFormItem,
    wsButtons,
  },
  props: {
    fieldItem: {
      default() {
        return {}
      },
      type: Object,
    },
    rules: {
      default() {
        return {}
      },
      type: Object,
    },
    // 下拉框选项配置数组
    allOptions: {
      default() {
        return {}
      },
      type: Object,
    },
    // 表格单元格占位
    placeholder: {
      default: '',
      type: String,
    },
    // 过滤表格操作按钮
    filterButtons: {
      default(buttonConfigList, row) {
        return buttonConfigList
      },
      type: Function,
    },
    // 表单元素切换判断函数
    switchFn: {
      type: Function,
    },
    // 表单项单独配置
    setFieldItem: {
      type: Function,
      default(fieldItem, row, column, $index) {
        return fieldItem
      },
    },
    // 列切换模式
    switchModeData: {
      default: '', // dblclick/rowControl
      type: String | Array,
    },
    // 列切换字段
    switchKey: {
      default: 'isEdit__table',
      type: String,
    },
    property: {
      default: '',
      type: String,
    },
    index: {
      default: '',
      type: String | Number,
    },
    // 表单数据
    formData: {
      default() {
        return {}
      },
      type: Object,
    },
    // 标题栏有搜索功能
    showSearchHeader: {
      default: false,
      type: Boolean,
    },
    // 节流防抖配置  { mode: 'throttle' | 'debounce', delay: 500, immediate: false | true }
    TDConfig: {
      type: Object,
      default() {
        return {}
      },
    },
    // 额外的引入的组件
    extraComponents: {
      default() {
        return {}
      },
      type: Object,
    },
  },
  data() {
    return {
      temRow: {},
    }
  },
  //自定义指令
  directives: {
    focus: {
      inserted: function (el, { value }) {
        if (!value) return
        el.querySelector('input').focus()
      },
    },
  },
  methods: {
    getRandomId,
    getShowValue,
    // 监听转发事件
    async happenEvent(buttonItem, { row, column, $index }) {
      this.$emit('happenEvent', {
        method: buttonItem.method,
        buttonItem,
        row,
        column,
        $index,
      })
    },
    // 动态获取校验
    getRules(fieldItem, row) {
      if (!fieldItem.required || row[fieldItem.disabledKey]) return
      const ruleDateComponent = [
        'el-date-picker',
        'el-time-select',
        'el-time-picker',
      ]
      let rules = deepClone(this.rules[fieldItem.prop])
      if (ruleDateComponent.includes(fieldItem.component)) {
        const formData = row
        let { minTimeProp, maxTimeProp, minDate, maxDate } = fieldItem
        minDate = typeof minDate === 'function' ? minDate() : minDate
        maxDate = typeof maxDate === 'function' ? maxDate() : maxDate
        const minValue = formData[minTimeProp] || minDate || 0
        const maxValue = formData[maxTimeProp] || maxDate || 0
        if (minValue) {
          rules.push({
            validator: getMinValidator(fieldItem, minValue),
            trigger: 'change',
          })
        }
        if (maxValue) {
          rules.push({
            validator: getMaxValidator(fieldItem, maxValue),
            trigger: 'change',
          })
        }
      }
      return rules
    },
    // input框失焦处理
    handleBlur(fieldItem, row) {
      // 延迟清空，防止change事件还没触发，表单元素就切换了
      setTimeout(() => {
        // this.property = ''
        // this.index = ''
        this.$emit('update:property', '')
        this.$emit('update:index', '')
      }, 200)
    },

    // 表格内复选框变更
    fieldItemChange(fieldItem, row, method = 'tableFieldChange') {
      if (row.rowType__table === 'searchRow') method = 'search'
      this.$emit('happenEvent', {
        method,
        buttonItem: { method },
        fieldItem,
        row,
      })
    },
    // 判断是否显示表单元素
    judgeShowFormItem(fieldItem, row, column, $index) {
      const { switchModeData, switchKey, property, index, switchFn } = this
      return (
        (fieldItem.component || fieldItem.formSlotName) &&
        ((!switchModeData && !switchFn) ||
          (switchModeData.includes('dblclick') &&
            property === fieldItem.prop &&
            index === $index) ||
          (switchModeData.includes('rowControl') && row[switchKey]) ||
          (switchFn && switchFn(fieldItem, row, column, $index)))
      )
    },
  },
}
</script>

<style lang="less">
.el-picker-panel.hideCurrent {
  .el-button--text.el-picker-panel__link-btn {
    display: none;
  }
}
</style>
<style lang="less" scoped>
.drag-handle {
  cursor: move;
  font-size: 20px;
}
.overflow_tip {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
.rich-text {
  white-space: normal;
  text-align: start;
}
.el-table__cell {
  .el-form-item {
    // 防止宽度小数，触发tooltip
    width: 99%;
    margin-right: 0;
    /deep/ .el-form-item__content {
      width: 100%;
      // line-height: initial;
    }
  }
}
// 表单元素样式
/deep/ .el-table tr input[type='checkbox'] {
  cursor: pointer;
}
</style>
