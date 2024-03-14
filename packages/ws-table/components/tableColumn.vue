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
      width: (fieldItem.buttonConfigList || []).length * 55,
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
        }"
      >
        <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
          <slot :name="name" v-bind="{ ...scope, fieldItem }"></slot>
        </template>
      </ws-buttons>
    </template>
  </el-table-column>
  <!-- 内容列 -->
  <el-table-column
    v-else
    v-bind="{
      align: 'center',
      resizable: true,
      ...fieldItem,
      showOverflowTooltip: true,
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
      <el-form-item v-if="fieldItem.component && showHeaderSearch">
        <!-- 表单元素显示 -->
        <component
          :is="fieldItem.component"
          v-model="formData[fieldItem.prop]"
          @change="fieldItemChange(fieldItem, formData, 'search')"
          @blur="handleBlur(fieldItem, formData)"
          @input="handleInput($event, fieldItem, formData)"
          v-bind="{
            size: 'mini',
            'popper-class': fieldItem.timeDisabled ? 'hideCurrent' : '',
            options: allOptions[fieldItem.prop],
            ...getAttrs(fieldItem, formData),
          }"
          v-on="{
            // fieldItem.listeners和上面的事件一起触发，上面先触发
            ...(fieldItem.listeners || {}),
          }"
        >
          <template v-if="fieldItem.component === 'el-select'">
            <template v-for="item in allOptions[fieldItem.prop]">
              <el-option-group
                v-if="item.children"
                :key="item.label"
                v-bind="item"
              >
                <el-option
                  v-for="nextItem in item.children"
                  :key="nextItem.label + nextItem.value"
                  v-bind="nextItem"
                >
                  <slot
                    v-if="fieldItem.selectSlotName"
                    :name="fieldItem.selectSlotName"
                    v-bind="nextItem"
                  ></slot>
                </el-option>
              </el-option-group>
              <el-option v-else :key="item.label + item.value" v-bind="item">
                <slot
                  v-if="fieldItem.selectSlotName"
                  :name="fieldItem.selectSlotName"
                  v-bind="item"
                ></slot
              ></el-option>
            </template>
          </template>
          <template v-if="fieldItem.component === 'el-radio-group'">
            <el-radio
              v-for="item in allOptions[fieldItem.prop]"
              :key="item.value"
              v-bind="{
                ...item,
                label: item.value,
              }"
              >{{ item.label }}</el-radio
            >
          </template>
          <template v-if="fieldItem.component === 'el-checkbox-group'">
            <el-checkbox
              v-for="item in allOptions[fieldItem.prop]"
              :key="item.value"
              v-bind="{
                ...item,
                label: item.value,
              }"
              >{{ item.label }}</el-checkbox
            >
          </template>
        </component>
      </el-form-item>
    </template>
    <!-- 内容插槽 -->
    <template
      v-slot="{ row, column, $index }"
      v-if="!fieldItem.type || (fieldItem.type && fieldItem.slotName)"
    >
      <!-- 表单元素 -->
      <!-- 表单元素编辑模式 -->
      <el-form-item
        v-if="judgeShowFormItem(fieldItem, row, $index)"
        :prop="`${row.prop__table}.${fieldItem.prop}`"
        :rules="getRules(fieldItem, row)"
      >
        <!-- 命名插槽 -->
        <slot
          v-if="fieldItem.formSlotName"
          :name="fieldItem.formSlotName"
          v-bind="{ row, column, $index, fieldItem }"
        >
          <!-- 用了插槽就不会显示默认的内容 -->
        </slot>
        <!-- 表单元素显示 -->
        <component
          v-else
          :is="fieldItem.component"
          v-bind="{
            size: 'mini',
            'popper-class': fieldItem.timeDisabled ? 'hideCurrent' : '',
            disabled: row[fieldItem.disabledKey],
            ...getAttrs(fieldItem, row),
          }"
          v-focus="switchModeData.includes('dblclick') && !row[switchKey]"
          v-model="row[fieldItem.prop]"
          @change="fieldItemChange(fieldItem, row)"
          @blur="handleBlur(fieldItem, row)"
          @input="handleInput($event, fieldItem, row)"
          v-on="{
            // fieldItem.listeners和上面的事件一起触发，上面先触发
            ...(fieldItem.listeners || {}),
          }"
        >
          <template v-if="fieldItem.component === 'el-select'">
            <template v-for="item in allOptions[fieldItem.prop]">
              <el-option-group
                v-if="item.children"
                :key="item.label"
                v-bind="item"
              >
                <el-option
                  v-for="nextItem in item.children"
                  :key="nextItem.label + nextItem.value"
                  v-bind="nextItem"
                >
                  <slot
                    v-if="fieldItem.selectSlotName"
                    :name="fieldItem.selectSlotName"
                    v-bind="nextItem"
                  ></slot>
                </el-option>
              </el-option-group>
              <el-option v-else :key="item.label + item.value" v-bind="item">
                <slot
                  v-if="fieldItem.selectSlotName"
                  :name="fieldItem.selectSlotName"
                  v-bind="item"
                ></slot
              ></el-option>
            </template>
          </template>
          <template v-if="fieldItem.component === 'el-radio-group'">
            <el-radio
              v-for="item in allOptions[fieldItem.prop]"
              :key="item.value"
              v-bind="{
                ...item,
                label: item.value,
              }"
              >{{ item.label }}</el-radio
            >
          </template>
          <template v-if="fieldItem.component === 'el-checkbox-group'">
            <el-checkbox
              v-for="item in allOptions[fieldItem.prop]"
              :key="item.value"
              v-bind="{
                ...item,
                label: item.value,
              }"
              >{{ item.label }}</el-checkbox
            >
          </template>
        </component>
      </el-form-item>
      <!-- 表单元素 非编辑模式 -->
      <template v-else>
        <!-- 命名插槽 -->
        <template v-if="fieldItem.slotName">
          <slot
            :name="fieldItem.slotName"
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
  getAttrs,
  getMaxValidator,
  getMinValidator,
  getRandomId,
  getShowValue,
} from '../../utils/util'
import wsButtons from '../../ws-buttons/index.vue'
export default {
  name: 'tableColumn',
  components: {
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
    // 列切换模式
    switchModeData: {
      default: '', // dblclick/rowControl
      type: String | Array,
    },
    // 表单数据
    formData: {
      default() {
        return {}
      },
      type: Object,
    },
    // 标题栏有搜索功能
    showHeaderSearch: {
      default: false,
      type: Boolean,
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
    getAttrs,
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
        if (fieldItem.minTimeProp) {
          const minField = fieldItem.minTimeProp
          rules.push({
            validator: getMinValidator(fieldItem, row[minField]),
            trigger: 'change',
          })
        }
        if (fieldItem.maxTimeProp) {
          const maxField = fieldItem.maxTimeProp
          rules.push({
            validator: getMaxValidator(fieldItem, row[maxField]),
            trigger: 'change',
          })
        }
      }
      return rules
    },
    // input框失焦处理
    handleBlur(fieldItem, row) {
      const { prop, blurHandler: handler } = fieldItem
      const temRow = this.temRow
      this.temRow = {}
      // 延迟清空，防止change事件还没触发，表单元素就切换了
      setTimeout(() => {
        // this.property = ''
        // this.index = ''
        this.$emit('update:property', '')
        this.$emit('update:index', '')
      }, 200)
      // 如果前后值相同则不处理
      if (row[prop] == temRow[prop]) {
        return
      }
      // 自定义数据过滤
      if (typeof handler === 'function') {
        const newValue = handler(row[prop])
        row[prop] = newValue
      }
      // this.fieldItemChange(fieldItem, row, 'tableFieldBlur')
    },
    // input框输入处理
    handleInput(value, fieldItem, row) {
      const { prop, inputHandler: handler } = fieldItem
      if (typeof handler === 'function') {
        const newValue = handler(value)
        row[prop] = newValue
      }
      // this.fieldItemChange(fieldItem, row, 'tableFieldInput')
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
    width: 100%;
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
  // height: 100%;
  // display: flex;
  // align-items: center;
  // flex-wrap: wrap;
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
  // height: 100%;
  // display: flex;
  // align-items: center;
  // flex-wrap: wrap;
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
</style>
