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
      :fieldItem="column"
      :rules="rules"
      :allOptions="allOptions"
      :placeholder="placeholder"
      :switchConfig="switchConfig"
      @happenEvent="(params) => $emit('happenEvent', params)"
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
      width: (fieldItem.buttonConfigList || []).length * 70,
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
          buttonConfigList: filterButtons(
            row,
            fieldItem.buttonConfigList || []
          ),
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
    align="center"
    v-bind="{
      showOverflowTooltip: !fieldItem.component,
      resizable: true,
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
        {{ fieldItem.label }}
      </slot>
      <template v-else>
        {{ fieldItem.label }}
        <i style="color: #f56c6c" v-if="fieldItem.required">*</i>
      </template>
    </template>
    <!-- 内容插槽 -->
    <template
      v-slot="{ row, column, $index }"
      v-if="!fieldItem.type || (fieldItem.type && fieldItem.slotName)"
    >
      <!-- 命名插槽 -->
      <template v-if="fieldItem.slotName">
        <slot
          :name="fieldItem.slotName"
          v-bind="{ row, column, $index, fieldItem }"
        >
          {{
            row[fieldItem.prop] || row[fieldItem.prop] === 0
              ? row[fieldItem.prop]
              : fieldItem.placeholder || placeholder
          }}
        </slot>
      </template>
      <!-- 表单元素 -->
      <el-form-item
        v-else-if="fieldItem.component"
        :prop="`${row.prop__table}.${fieldItem.prop}`"
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
        <template v-else>
          <!-- 表单元素显示 -->
          <component
            v-if="
              !switchMode ||
              (switchMode === 'dblclick' &&
                property === fieldItem.prop &&
                index === $index) ||
              (switchMode === 'rowControl' && row[switchKey])
            "
            :is="fieldItem.component"
            v-bind="{
              size: 'mini',
              'popper-class': fieldItem.timeDisabled ? 'hideCurrent' : '',
              disabled: row[fieldItem.disabledKey],
              ...getAttrs(fieldItem, row),
            }"
            v-focus="switchMode === 'dblclick'"
            v-model="row[fieldItem.prop]"
            @change="fieldItemChange(fieldItem, row)"
            @blur="handleBlur(row, fieldItem)"
            @input="handleInput($event, row, fieldItem)"
          >
            <template v-if="fieldItem.component === 'el-select'">
              <el-option
                v-for="item in allOptions[fieldItem.prop]"
                :key="item.label"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </template>
          </component>
          <!--allowToggle控制是否能够双击切换-->
          <ws-tooltip
            placement="top"
            :content="getComponentShowValue(row, fieldItem)"
            overflow
            v-else
          >
            <div
              style="min-height: 23px"
              @dblclick="toggleInput(row, column, $index)"
              class="overflow_tip"
            >
              {{ getComponentShowValue(row, fieldItem) }}
            </div>
          </ws-tooltip>
        </template>
      </el-form-item>
      <!-- 格式化 -->
      <template v-else-if="fieldItem.formatter">{{
        fieldItem.formatter(row[fieldItem.prop], row, column, $index) ||
        fieldItem.placeholder ||
        placeholder
      }}</template>
      <!-- 默认 -->
      <template v-else>{{
        row[fieldItem.prop] || row[fieldItem.prop] === 0
          ? row[fieldItem.prop]
          : fieldItem.placeholder || placeholder
      }}</template>
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
  format,
} from '../../utils/util'
import wsButtons from '../../ws-buttons/index.vue'
import wsTooltip from '../../ws-tooltip/index.vue'
export default {
  name: 'tableColumn',
  components: {
    wsButtons,
    wsTooltip,
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
    // 过滤表格操作按钮
    filterButtons: {
      default(row, buttonConfigList) {
        return buttonConfigList
      },
      type: Function,
    },
    // 表格单元格占位
    placeholder: {
      default: '',
      type: String,
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
  computed: {
    switchMode() {
      return this.switchConfig.switchMode
    },
    switchKey() {
      return this.switchConfig.switchKey || 'isEdit__table'
    },
  },
  data() {
    return {
      temRow: {},
      property: '',
      index: '',
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
    // 监听转发事件
    async happenEvent(buttonItem, { row, column, $index }) {
      this.$emit('happenEvent', {
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
    // 点击切换input 框
    toggleInput(row, column, $index) {
      this.index = $index
      this.property = column.property
      this.temRow = deepClone(row)
    },
    // input框失焦处理
    handleBlur(row, fieldItem) {
      // this.fieldItemChange(fieldItem, row, 'tableFieldBlur')
      const { prop, blurHandler: handler } = fieldItem
      setTimeout(() => {
        this.property = ''
        this.index = ''
      }, 100)
      // 如果前后值相同则不处理
      if (row[prop] == this.temRow[prop]) {
        return
      }
      // 自定义数据过滤
      if (typeof handler === 'function') {
        const newValue = handler(row[prop])
        row[prop] = newValue
      }
    },
    // input框输入处理
    handleInput(value, row, fieldItem) {
      // this.fieldItemChange(fieldItem, row, 'tableFieldInput')
      const { prop, inputHandler: handler } = fieldItem
      if (typeof handler === 'function') {
        const newValue = handler(value)
        row[prop] = newValue
      }
    },
    // 表格内复选框变更
    fieldItemChange(fieldItem, row, method = 'tableFieldChange') {
      this.$emit('happenEvent', {
        buttonItem: { method },
        fieldItem,
        row,
      })
    },
    // 获取组件模式对应的值
    getComponentShowValue(row, fieldItem) {
      if (!row[fieldItem.prop]) return fieldItem.placeholder || this.placeholder
      const { prop, componentAttrs = {}, component, formatter } = fieldItem
      if (formatter) {
        return formatter(row[prop])
      }
      if (component === 'el-date-picker' && componentAttrs.format) {
        return format(new Date(row[prop]), componentAttrs.format)
      }
      if (component === 'el-select') {
        const options = this.allOptions[prop] || []
        const option = options.find((item) => item.value === row[prop])
        return option ? option.label : ''
      }
      return row[prop]
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
/deep/ .el-table tr input[type='checkbox'] {
  cursor: pointer;
}
.overflow_tip {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
.el-table__cell {
  .el-form-item {
    width: 100%;
    /deep/ .el-form-item__content {
      width: 100%;
    }
  }
}
</style>
