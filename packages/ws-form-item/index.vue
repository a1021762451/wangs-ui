<template>
  <el-form-item
    class="ws-form-item"
    :class="{
      'form-item-with-suffixLabel': fieldItem.suffixLabel,
    }"
    v-bind="$attrs"
  >
    <template v-slot:label v-if="fieldItem.labelSlotName">
      <slot :name="fieldItem.labelSlotName"></slot>
    </template>
    <slot
      v-if="fieldItem.controlSlotName"
      :name="fieldItem.controlSlotName"
      :formData="formData"
      :fieldItem="fieldItem"
      :fieldItemChange="fieldItemChange"
    ></slot>
    <component
      v-else-if="fieldItem.component"
      :is="fieldItem.component"
      v-model="formData[fieldItem.prop]"
      @change="fieldItemChange(fieldItem, formData)"
      @blur="handleBlur(formData, fieldItem)"
      @input="handleInput($event, formData, fieldItem)"
      v-bind="{
        disabled: fieldItem.disabledKey && formData[fieldItem.disabledKey],
        options: getOptions(fieldItem, allOptions, formData),
        ...getAttrs(fieldItem, formData, formStatus !== 'edit'),
      }"
      v-on="{
        // fieldItem.listeners和上面的事件一起触发，上面先触发
        ...(fieldItem.listeners || {}),
      }"
      v-focus="vFocus"
    >
      <template v-if="fieldItem.component === 'el-select'">
        <template v-for="item in getOptions(fieldItem, allOptions, formData)">
          <el-option-group v-if="item.children" :key="item.label" v-bind="item">
            <el-option
              v-for="nextItem in item.children"
              :key="nextItem.label + nextItem.value"
              v-bind="nextItem"
            >
              <slot
                v-if="fieldItem.selectSlotName"
                :name="fieldItem.selectSlotName"
                v-bind="nextItem"
              ></slot
            ></el-option>
          </el-option-group>
          <el-option v-else :key="item.label + item.value" v-bind="item">
            <slot
              v-if="fieldItem.selectSlotName"
              :name="fieldItem.selectSlotName"
              v-bind="item"
            ></slot>
          </el-option>
        </template>
      </template>
      <template v-if="fieldItem.component === 'el-radio-group'">
        <el-radio
          v-for="item in getOptions(fieldItem, allOptions, formData)"
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
          v-for="item in getOptions(fieldItem, allOptions, formData)"
          :key="item.value"
          v-bind="{
            ...item,
            label: item.value,
          }"
          >{{ item.label }}</el-checkbox
        >
      </template>
    </component>
    <div v-else class="content">
      <span
        v-if="formData[fieldItem.prop]"
        class="content-text"
        :style="{ textAlign: fieldItem.align || 'left' }"
      >
        {{ formData[fieldItem.prop] }}
      </span>
    </div>
    <span class="suffix-label" v-if="fieldItem.suffixLabel">{{
      fieldItem.suffixLabel
    }}</span>
  </el-form-item>
</template>

<script>
import { getAttrs, getOptions } from '../utils/util'
export default {
  name: 'ws-form-item',
  components: {
    check: () => import('./components/check'),
  },
  props: {
    fieldItem: {
      type: Object,
      default: () => ({}),
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
    fieldItemChange: {
      type: Function,
      default: () => {},
    },
    // 下拉框选项配置数组
    allOptions: {
      type: Object,
      default: () => ({}),
    },
    // 表单模式 -- detail：详情模式, review：审阅模式  edit:新增或编辑模式
    // detail时，表单元素不可编辑，没有操作按钮；review时，表单元素不可编辑，有操作按钮；edit时，表单元素可编辑，有操作按钮
    formStatus: {
      default: 'edit',
      type: String,
    },
    // 额外的引入的组件
    extraComponents: {
      default() {
        return {}
      },
      type: Object,
    },
    // v-focus条件判断
    vFocus: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      temRow: {},
    }
  },
  created() {
    this.addComponents()
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
    getOptions,
    // input框失焦处理, liseners中的blur事件也会触发，handleBlur方法先触发
    handleBlur(row, fieldItem) {
      const { prop, blurHandler: handler } = fieldItem
      this.$emit('blur')
      if (!handler) return
      const temRow = this.temRow
      this.temRow = {}
      // 如果前后值相同则不处理
      if (row[prop] == temRow[prop]) {
        return
      }
      // 自定义数据过滤
      if (typeof handler === 'function') {
        const newValue = handler(row[prop])
        row[prop] = newValue
      }
      // this.fieldItemChange(fieldItem, row, 'formFieldBlur')
    },
    // input框输入处理
    handleInput(value, row, fieldItem) {
      const { prop, inputHandler: handler } = fieldItem
      if (typeof handler === 'function') {
        const newValue = handler(value)
        row[prop] = newValue
      }
      // this.fieldItemChange(fieldItem, row, 'formFieldInput')
    },
    // 增加额外的组件
    addComponents() {
      const extraComponentsKeys = Object.keys(this.extraComponents)
      extraComponentsKeys.forEach((key) => {
        this.$options.components[key] = this.extraComponents[key]
      })
    },
  },
}
</script>

<style lang="less" scoped>
.form-item-with-suffixLabel {
  /deep/ .el-form-item__content {
    display: flex;
    align-items: center;
  }
  .suffix-label {
    margin-left: 4px;
  }
}
.content {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  .content-text {
    flex: 1;
    padding: 0 15px;
  }
}
// 表单元素样式
/deep/ .el-input.is-disabled .el-input__inner {
  color: #959090;
}
/deep/ .el-textarea.is-disabled .el-textarea__inner {
  color: #959090;
}
/deep/ .el-textarea .el-input__count {
  // 避免form-item line-height影响
  line-height: initial;
}
/deep/ .el-input-number {
  width: 100%;
}
/deep/ .el-select {
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
/deep/ .el-date-editor.el-input__inner {
  width: 100%;
}
/deep/ .el-date-editor.el-input {
  width: 100%;
}
/deep/ .el-autocomplete {
  width: 100%;
}
</style>
