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
      :switchMode="switchMode"
      :switchKey="switchKey"
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
          buttonConfigList: fieldItem.filterButtons
            ? fieldItem.filterButtons(fieldItem.buttonConfigList, row)
            : fieldItem.buttonConfigList,
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
      showOverflowTooltip: !fieldItem.component,
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
      <!-- 表单元素 -->
      <template v-if="fieldItem.component">
        <!-- 表单元素编辑模式 -->
        <el-form-item
          v-if="
            !switchMode ||
            (switchMode.includes('dblclick') &&
              property === fieldItem.prop &&
              index === $index) ||
            (switchMode.includes('rowControl') && row[switchKey])
          "
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
            v-focus="switchMode.includes('dblclick') && !row[switchKey]"
            v-model="row[fieldItem.prop]"
            @change="fieldItemChange(fieldItem, row)"
            @blur="handleBlur(fieldItem, row)"
            @input="handleInput($event, fieldItem, row)"
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
        <!-- 表单元素非编辑模式 -->
        <!--allowToggle控制是否能够双击切换-->
        <ws-tooltip
          v-else
          placement="top"
          :content="
            !fieldItem.slotName
              ? getShowValue(
                  row,
                  column,
                  $index,
                  fieldItem,
                  allOptions,
                  placeholder
                )
              : ''
          "
          overflow
        >
          <div
            style="min-height: 23px"
            @dblclick="toggleInput(row, column, $index)"
            class="overflow_tip"
          >
            <!-- 命名插槽 -->
            <slot
              v-if="fieldItem.slotName"
              :name="fieldItem.slotName"
              v-bind="{ row, column, $index, fieldItem }"
            >
              <!-- 用了插槽就不会显示默认的内容 -->
            </slot>
            <template v-else>
              {{
                getShowValue(
                  row,
                  column,
                  $index,
                  fieldItem,
                  allOptions,
                  placeholder
                )
              }}
            </template>
          </div>
        </ws-tooltip>
      </template>
      <!-- 命名插槽 -->
      <template v-else-if="fieldItem.slotName">
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
    // 表格单元格占位
    placeholder: {
      default: '',
      type: String,
    },
    // 列切换模式
    switchMode: {
      default: '', // dblclick/rowControl
      type: String,
    },
    // 列切换字段
    switchKey: {
      default: 'isEdit__table',
      type: String,
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
    getShowValue,
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
    handleBlur(fieldItem, row) {
      const { prop, blurHandler: handler } = fieldItem
      const temRow = this.temRow
      this.temRow = {}
      // 延迟清空，防止change事件还没触发，表单元素就切换了
      setTimeout(() => {
        this.property = ''
        this.index = ''
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
      this.$emit('happenEvent', {
        buttonItem: { method },
        fieldItem,
        row,
      })
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
.rich-text {
  white-space: normal;
  text-align: start;
}
.el-table__cell {
  .el-form-item {
    width: 100%;
    /deep/ .el-form-item__content {
      width: 100%;
      line-height: initial;
    }
  }
}
</style>
