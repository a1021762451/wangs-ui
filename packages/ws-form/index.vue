<template>
  <div
    v-resize.window.immediate="judgeOneRow"
    class="render"
    :class="{
      searchMode: isSearchList,
      formMode: !isSearchList,
      checkform: isCheckform,
    }"
    ref="wsForm"
  >
    <!-- 条件行 -->
    <template v-if="isCheckform">
      <condition
        style="padding-bottom: 10px"
        clearButtontext="重置条件"
        v-model="conditionOptions"
        @remove-tag="conditionRemove"
        @clear="conditionClear"
      />
      <div class="border-line"></div>
    </template>
    <el-form
      :style="{
        height: isFold ? colHeight + 'px' : undefined,
      }"
      class="weighting"
      :class="{
        isFold,
        no_lable_wrap: labelWidth !== 'auto',
        has_lable_wrap: labelWidth === 'auto',
        has_rules: Object.keys(rules).length,
        no_rules: !Object.keys(rules).length,
      }"
      ref="form"
      v-bind="{
        rules,
        model: formData,
        labelWidth,
        labelPosition,
        'validate-on-rule-change': false,
        ...$attrs,
      }"
      v-on="$listeners"
    >
      <el-row
        :gutter="gutter"
        type="flex"
        :style="{
          transform: isFold
            ? `translateY(-100%) translateY(${colHeight}px)`
            : undefined,
        }"
      >
        <!-- 表单元素 -->
        <template v-for="(fieldItem, index) in configList">
          <el-col
            :span="fieldItem.span"
            :style="{ marginRight: `${(fieldItem.offestRight * 100) / 24}%` }"
            :class="{
              'border-bottom': isCheckform && !judgeIsRow(fieldItem),
            }"
            :key="fieldItem.prop"
          >
            <!-- notLeftMargin: fieldItem.isSide && isSearchList, -->
            <el-form-item
              :class="{
                'form-item-with-suffixLabel': fieldItem.suffixLabel,
              }"
              v-bind="fieldItem"
              :required="undefined"
            >
              <template v-slot:label v-if="fieldItem.labelSlotName">
                <slot :name="fieldItem.labelSlotName"></slot>
              </template>
              <slot
                v-if="fieldItem.slotName"
                :name="fieldItem.slotName"
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
                  options: allOptions[fieldItem.prop],
                  ...getAttrs(fieldItem, formData, isDetail),
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
                        ></slot
                      ></el-option>
                    </el-option-group>
                    <el-option
                      v-else
                      :key="item.label + item.value"
                      v-bind="item"
                    >
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
              <span class="suffix-label" v-if="fieldItem.suffixLabel">{{
                fieldItem.suffixLabel
              }}</span>
            </el-form-item>
          </el-col>
          <div
            v-if="
              isCheckform &&
              judgeIsRow(fieldItem) &&
              (index !== configList.length - 1 ||
                (index == configList.length - 1 && !isFold))
            "
            class="border-line"
            :key="fieldItem.prop + 'line'"
          ></div>
        </template>
        <!-- 按钮 -->
        <el-form-item
          v-if="hasButtons"
          class="form-item-buttons"
          ref="searchModeList"
        >
          <ws-buttons
            :buttonConfigList="buttonsList"
            :buttonSize="buttonSize || size"
            class="buttons"
            @happenEvent="happenEvent"
          >
            <template
              v-for="(index, name) in $scopedSlots"
              v-slot:[name]="scope"
            >
              <slot :name="name" v-bind="scope"></slot>
            </template>
            <template slot="suffix">
              <el-link
                v-show="isSearchList && (exceedOneRow || isFold)"
                :underline="false"
                :size="buttonSize || size"
                type="primary"
                @click="isFold = !isFold"
                class="fold-button"
                ><span class="fold-text">{{ !isFold ? '收起' : '展开' }}</span
                ><i
                  :class="!isFold ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
                ></i
              ></el-link>
            </template>
          </ws-buttons>
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<script>
const defaultButtons = [
  {
    method: 'search',
    label: '查询',
  },
  {
    method: 'reset',
    label: '重置',
    type: 'plain',
  },
]
const defaultButtonsForForm = [
  {
    method: 'confirm',
    label: '确认',
  },
  {
    method: 'cancel',
    label: '取消',
    type: 'plain',
  },
]
import {
  deepClone,
  getAttrs,
  getMaxValidator,
  getMinValidator,
  getDefaultTime,
  vResize,
  getObjAttr,
} from '../utils/util'
import check from './components/check.vue'
import condition from './components/condition.vue'
import wsButtons from '../ws-buttons/index.vue'
import mixins from './mixins'
export default {
  name: 'ws-form',
  mixins: [mixins],
  components: { check, condition, wsButtons },
  data() {
    return {
      cloneForm: {},
      isFold: false,
      exceedOneRow: false,
      buttonsList: [],
      configList: [],
      colHeight: '50',
      conditionOptions: [],
    }
  },
  props: {
    // 表单元素配置数组
    formConfigList: {
      default() {
        return []
      },
      type: Array,
    },
    // 下拉框选项配置数组
    allOptions: {
      default() {
        return {}
      },
      type: Object,
    },
    // 表单数据
    formData: {
      default() {
        return {}
      },
      type: Object,
    },
    // 是否是搜索控件
    isSearchList: {
      default: false,
      type: Boolean,
    },
    // 是否是勾选表单--勾选组件多，且标签带边框
    isCheckform: {
      default: false,
      type: Boolean,
    },
    // 按钮组配置
    buttonConfigList: {
      default() {
        return []
      },
      type: Array,
    },
    // 按钮组尺寸
    buttonSize: {
      default: '',
      type: String,
    },
    // 是否是详情模式
    isDetail: {
      default: false,
      type: Boolean,
    },
    // 是否显示默认查询重置按钮
    useDefaultButtons: {
      default: true,
      type: Boolean,
    },
    // el-row 属性
    gutter: {
      default: 12,
      type: Number,
    },
    // 额外的引入的组件
    extraComponents: {
      default() {
        return {}
      },
      type: Object,
    },
    // 通用col
    span: {
      default: 6,
      type: Number,
    },
  },
  watch: {
    formConfigList: {
      handler() {
        const configList = deepClone(this.formConfigList)
        let remain = 0
        let total = 0
        configList.forEach((item, index) => {
          const { component, listeners } = item
          item.span = item.span || this.span
          // 搜索模式下判断表单元素是否在最左边
          if (this.isSearchList) {
            const span = item.span || 6
            total += span
            const newRemain = Math.floor((total - 1) / 24)
            if (newRemain !== remain || index === 0) {
              this.$set(item, 'isSide', true)
              remain = newRemain
            }
          }
          // 设置默认时间
          if (item.defaultTimeType) {
            const { componentAttrs = {} } = item
            this.$set(
              this.formData,
              item.prop,
              getDefaultTime(item.defaultTimeType, componentAttrs.valueFormat)
              // componentAttrs.valueFormat
              //   ? format(new Date(), componentAttrs.valueFormat)
              //   : new Date()
            )
          }
          // 判断是否需要初始化表单值
          if (!this.formData.hasOwnProperty(item.prop)) {
            this.$set(this.formData, item.prop, '')
            // 特殊情况
            component === 'el-checkbox-group' &&
              this.$set(this.formData, item.prop, [])
          }
          // listeners处理
          if (listeners && typeof listeners === 'object') {
            Object.keys(listeners).forEach((key) => {
              listeners[key] = listeners[key].bind(this.$parent)
            })
          }
          // 勾选表单处理
          if (this.isCheckform) {
            // 初始化conditionOptions
            this.changeConditionItem(item)
            // 处理换行逻辑
            if (item.childern || component === 'check') {
              item.span = 24
            } else {
              item.isRow = true
            }
          }
          // 处理isRow属性
          if (item.isRow) {
            item.offestRight = 24 - item.span
          }
        })
        this.configList = configList
      },
      immediate: true,
    },
    buttonConfigList: {
      handler() {
        const arr = this.useDefaultButtons
          ? this.isSearchList
            ? this.isCheckform
              ? defaultButtons.filter((item) => item.method !== 'reset')
              : defaultButtons
            : defaultButtonsForForm
          : []
        this.buttonsList = this.buttonConfigList.concat(arr)
      },
      immediate: true,
    },
  },
  computed: {
    rules() {
      let obj = {}
      const blurEletypes = ['el-input', 'el-input-number']
      const ruleDateComponent = [
        'el-date-picker',
        'el-time-select',
        'el-time-picker',
      ]
      this.formConfigList.forEach((fieldItem) => {
        const { component = '', required, disabled } = fieldItem
        if (!required || disabled) return
        const messageSuffix =
          !component || component.includes('input') ? '输入' : '选择'
        obj[fieldItem.prop] = fieldItem.rule || [
          {
            required: true,
            message: `请${messageSuffix}${fieldItem.label}`,
            trigger: 'change',
            // trigger: blurEletypes.includes(fieldItem.component)
            //   ? 'blur'
            //   : 'change',
          },
        ]
        if (ruleDateComponent.includes(fieldItem.component)) {
          if (fieldItem.minTimeProp) {
            const minField = fieldItem.minTimeProp
            obj[fieldItem.prop].push({
              validator: getMinValidator(fieldItem, this.formData[minField]),
              trigger: 'change',
            })
          }
          if (fieldItem.maxTimeProp) {
            const maxField = fieldItem.maxTimeProp
            obj[fieldItem.prop].push({
              validator: getMaxValidator(fieldItem, this.formData[maxField]),
              trigger: 'change',
            })
          }
        }
      })
      return obj
    },
    // 是否显示按钮组
    hasButtons() {
      // this.configList.length > 0 &&
      return this.buttonsList.length > 0 && !this.isDetail
    },
    // 是否有查询按钮
    hasSearchButton() {
      return (
        this.hasButtons &&
        this.buttonsList.some((item) => item.method === 'search')
      )
    },
    size() {
      return this.$attrs.size
    },
    labelPosition() {
      return getObjAttr(this.$attrs, 'labelPosition')
    },
    labelWidth() {
      return getObjAttr(this.$attrs, 'labelWidth') || 'auto'
    },
  },
  created() {
    this.addComponents()
  },
  directives: {
    resize: vResize,
  },
  mounted() {
    // this.judgeOneRow()
    // window.addEventListener('resize', this.judgeOneRow)
    this.cloneForm = deepClone(this.formData)
    this.formMarginToPadding()
  },
  beforeDestroy() {
    // window.removeEventListener('resize', this.judgeOneRow)
  },
  methods: {
    getAttrs,
    // 判断是否占据一行
    judgeIsRow(fieldItem) {
      return fieldItem.isRow || fieldItem.span === 24
    },
    // 将form label的margin转换为padding
    async formMarginToPadding() {
      if (!this.isCheckform) return
      await this.$nextTick()
      const el = this.$refs.wsForm
      if (!el) return
      const formItems = el.getElementsByClassName('el-form-item')
      for (let i = 0; i < formItems.length; i++) {
        const formItem = formItems[i]
        const labelWrap = formItem.getElementsByClassName(
          'el-form-item__label-wrap'
        )[0]
        if (labelWrap) {
          const { marginLeft, marginRight, width } =
            window.getComputedStyle(labelWrap)
          if (this.labelWidth === 'auto' && marginRight) {
            // 正则匹配数字（小数或整数）和单位
            const reg = /(\d+)(\w+)/
            // marginLeft转换为数字和单位
            const marginLeftArr = marginLeft.match(reg)
            const marginLeftNum = +marginLeftArr[1]
            const marginLeftUnit = marginLeftArr[2]
            const marginLeftHalf = marginLeftNum / 2 + marginLeftUnit
            if (this.labelPosition === 'left') {
              labelWrap.style.paddingRight = marginLeft
            } else if (this.labelPosition === 'right') {
              labelWrap.style.paddingLeft = marginLeft
            } else {
              labelWrap.style.paddingLeft = marginLeftHalf
              labelWrap.style.paddingRight = marginLeftHalf
            }
            labelWrap.style.marginLeft = 0
            continue
          }
          labelWrap.style.paddingLeft = marginLeft
          labelWrap.style.marginLeft = 0
          labelWrap.style.paddingRight = marginRight
          labelWrap.style.marginRight = 0
        }
      }
    },
    // 变更条件或者用于初始化
    changeConditionItem({ prop, label }) {
      const value = this.formData[prop]
      let checkedValue
      if (this.allOptions[prop]) {
        const options = this.allOptions[prop]
        checkedValue = options.filter((item) => {
          return Array.isArray(value)
            ? value.includes(item.value)
            : value === item.value
        })
      } else {
        checkedValue = value
      }
      const findItem = this.conditionOptions.find((item) => item.prop === prop)
      if (findItem) {
        findItem.value = checkedValue
      } else {
        this.conditionOptions.push({
          label,
          prop: prop,
          value: checkedValue,
        })
      }
    },
    // 删除条件
    conditionRemove(item) {
      const { prop } = item
      this.formData[prop] = ''
    },
    // 删除所有条件
    async conditionClear() {
      // this.resetFields()
      this.happenEvent({ method: 'reset' })
      // 初始化conditionOptions
      this.configList.forEach((fieldItem) => {
        this.changeConditionItem(fieldItem)
      })
      // 没有按钮组时，触发刷新事件
      // if (this.isSearchList && !this.hasSearchButton) {
      //   this.resetValidate()
      // }
    },
    resetValidate() {
      this.validate((valid) => {
        // 重置完再次校验，校验通过则触发查询,否则清空校验
        if (valid) {
          this.handleSearch()
        } else {
          this.$nextTick(() => {
            this.clearValidate()
          })
        }
      })
    },
    // 增加额外的组件
    addComponents() {
      for (const key in this.extraComponents) {
        this.$options.components[key] = this.extraComponents[key]
      }
    },
    // 表格内复选框变更
    async fieldItemChange(fieldItem, formData, method = 'formFieldChange') {
      this.changeConditionItem(fieldItem)
      this.$emit('happenEvent', {
        method,
        buttonItem: { method },
        fieldItem,
        formData,
      })
      // 没有按钮组或没有查询按钮时，触发刷新事件
      if (this.isSearchList && !this.hasSearchButton) {
        // 校验单个字段
        await this.validateOneField(fieldItem.prop)
        this.handleSearch()
      }
    },
    validateOneField(prop) {
      return new Promise((resolve, reject) => {
        this.validateField(prop, (valid) => {
          valid ? reject(`${prop} is required`) : resolve()
        })
      })
    },
    // 判断高度是否只有一行，从而隐藏折叠按钮
    judgeOneRow() {
      if (!this.isSearchList || !this.hasButtons) return
      // 判断是否单行, 第一个col高度或者第一个row高度 与 整个form高度比较
      const el = this.$refs.wsForm
      if (!el) return
      let compareEle = el.getElementsByClassName('el-col')[0]
      if (!compareEle) compareEle = el.getElementsByClassName('el-row')[0]
      // exceedOneRow变动后，按钮组高度可能会变化，nextTick中获取按钮组高度
      this.$nextTick(() => {
        let searchModeListEl = this.$refs.searchModeList.$el
        this.colHeight = searchModeListEl.offsetHeight
      })
      if (!compareEle) {
        this.exceedOneRow = false
        return
      }
      const compareHeight = compareEle.offsetHeight
      this.exceedOneRow = el.offsetHeight - 10 > compareHeight
    },
    // 集中处理事件
    async happenEvent(buttonItem) {
      const { method } = buttonItem
      // method为reset则进行默认处理
      if (method === 'reset') {
        // const obj = deepClone(this.cloneForm)
        // this.$emit('update:formData', obj)
        this.resetFields()
        this.resetValidate()
        // await this.validate()
        // this.$nextTick(() => {
        //   this.clearValidate()
        // })
        // 同时触发重置事件，用于区分
        // this.handleSearch()
      }
      // method为search,comfirm则进行校验
      if (['search', 'confirm'].includes(method)) {
        await this.validate()
      }
      this.$emit('happenEvent', {
        method,
        buttonItem,
        formData: this.formData,
      })
    },
    handleSearch() {
      this.$emit('happenEvent', {
        method: 'search',
        buttonItem: { method: 'search' },
        formData: this.formData,
      })
    },
    // input框失焦处理, liseners中的blur事件也会触发，handleBlur方法先触发
    handleBlur(row, fieldItem) {
      const { prop, blurHandler: handler } = fieldItem
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
// 通用样式
.render {
  /deep/ .el-row--flex {
    flex-wrap: wrap;
  }
  .fold-button {
    // margin-left: 10px;
    // line-height: initial;
    .fold-text {
      margin: 0 5px;
    }
  }
  .form-item-with-suffixLabel {
    /deep/ .el-form-item__content {
      display: flex;
      align-items: center;
    }
    .suffix-label {
      margin-left: 4px;
    }
  }
  .border-bottom {
    border-bottom: 1px solid #ebeef5;
  }
  .border-line {
    width: 100%;
    height: 1px;
    background: #ebeef5;
  }
}
.isFold {
  overflow: hidden;
}
// 搜索模式样式
.searchMode {
  /deep/ .has_rules {
    .el-form-item--mini {
      margin-bottom: 14px;
    }
    .el-form-item--small {
      margin-bottom: 16px;
    }
    .el-form-item {
      margin-bottom: 18px;
    }
  }
  /deep/ .no_rules {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
  // weighting加权重
  /deep/ .weighting {
    .el-form-item {
      display: flex;
      .el-form-item__error {
        white-space: nowrap;
      }
      .el-form-item__content {
        margin-left: 0 !important;
        flex: 1;
        // line-height: initial;
      }
    }
    .form-item-buttons.el-form-item {
      margin-bottom: 0;
      .buttons {
        margin-left: 40px;
        /deep/ .el-button + .el-button,
        .el-checkbox.is-bordered + .el-checkbox.is-bordered {
          margin-left: 0;
        }
        /deep/ .el-button {
          margin-right: 10px;
        }
      }
    }
  }
  .notLeftMargin {
    /deep/ .el-form-item__label-wrap {
      margin-left: 0px !important;
    }
  }
}
// 表单模式样式
.formMode {
  /deep/ .form-item-buttons.el-form-item {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    .el-form-item__content {
      margin-left: 0 !important;
    }
    .buttons {
      margin-right: 10px;
    }
  }
}
// 额外的勾选模式
.checkform {
  /deep/ .el-col {
    padding: 10px 0;
  }
  /deep/ .weighting {
    .el-form-item {
      margin-bottom: 0;
      .el-form-item__label {
        padding: 0 6px 0;
        line-height: initial;
        white-space: nowrap;
      }
      .el-form-item__content {
        margin-left: 12px !important;
      }
    }
  }
  /deep/.has_lable_wrap {
    .el-form-item__label-wrap {
      align-self: flex-start;
      font-weight: 600;
      color: #333;
      background: #ececec;
      border-radius: 2px;
      padding: 3px 0;
    }
  }
  /deep/ .no_lable_wrap {
    .el-form-item__label {
      align-self: flex-start;
      font-weight: 600;
      color: #333;
      background: #ececec;
      border-radius: 2px;
      padding: 4px 6px;
    }
  }
  .form-item-buttons.el-form-item {
    padding-top: 10px;
  }
  .form-item-condition {
    padding-bottom: 10px;
  }
}
.checkform.isFold {
  .form-item-buttons.el-form-item {
    padding-top: 0;
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
</style>
