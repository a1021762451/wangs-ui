<template>
  <div
    class="render"
    :class="{ fold: isFold, searchMode: isSearchList }"
    :style="{ height: isFold ? colHeight + 'px' : undefined }"
    ref="wsForm"
  >
    <el-form
      :style="{
        transform: isFold
          ? `translateY(-100%) translateY(${colHeight}px)`
          : undefined,
      }"
      ref="formRef"
      label-width="auto"
      :model="formData"
      :rules="rules"
      :validate-on-rule-change="false"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <el-row :gutter="12" type="flex">
        <!-- 表单元素 -->
        <el-col
          :span="fieldItem.col || 6"
          v-for="fieldItem in configList"
          :key="fieldItem.prop"
        >
          <!-- ? Object.keys(rules).length
                  ? '18px'
                  : '18px' -->
          <el-form-item
            :class="{ notLeftMargin: fieldItem.isSide && isSearchList }"
            :style="{
              marginBottom: isSearchList
                ? Object.keys(rules).length
                  ? '18px'
                  : '5px'
                : undefined,
            }"
            v-bind="fieldItem"
            :required="undefined"
          >
            <template v-slot:label>
              <slot
                v-if="fieldItem.headerSlotName"
                :name="fieldItem.headerSlotName"
              ></slot>
              <template v-else>
                {{ fieldItem.label }}
                <span v-if="colon">:</span>
              </template>
            </template>
            <component
              v-if="fieldItem.component"
              :is="fieldItem.component"
              :popper-class="fieldItem.timeDisabled ? 'hideCurrent' : ''"
              v-model="formData[fieldItem.prop]"
              @change="fieldItemChange(fieldItem, formData)"
              @blur="
                fieldItem.component === 'el-input'
                  ? handleBlur(formData, fieldItem)
                  : undefined
              "
              @input="
                fieldItem.component === 'el-input'
                  ? handleInput($event, formData, fieldItem)
                  : undefined
              "
              v-bind="getAttrs(fieldItem, formData, isDetail)"
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
            <template v-else-if="fieldItem.slotName">
              <slot
                :name="fieldItem.slotName"
                :formData="formData"
                :fieldItem="fieldItem"
              ></slot>
            </template>
          </el-form-item>
        </el-col>
        <!-- 按钮 -->
        <el-form-item
          v-if="showButtons"
          :class="isSearchList ? 'searchMode-list' : 'formMode-ws-buttons'"
        >
          <ws-buttons
            :buttonConfigList="buttonsList"
            class="searchMode-ws-buttons"
            @happenEvent="happenEvent"
            :size="buttonSize"
          >
            <template
              v-for="(index, name) in $scopedSlots"
              v-slot:[name]="scope"
            >
              <slot :name="name" v-bind="scope"></slot>
            </template>
            <el-link
              v-if="isSearchList && exceedOneRow"
              :underline="false"
              :size="buttonSize"
              type="primary"
              @click="isFold = !isFold"
              class="fold-button"
              ><span class="fold-text">{{ !isFold ? '收起' : '展开' }}</span
              ><i
                :class="!isFold ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
              ></i
            ></el-link>
          </ws-buttons>
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import {
  deepClone,
  getPicker,
  getAttrs,
  getMaxValidator,
  getMinValidator,
  format,
  getDefaultTime,
} from '../utils/util'
import wsButtons from '../ws-buttons/index.vue'
export default {
  name: 'ws-form',
  components: { wsButtons },
  data() {
    return {
      cloneForm: {},
      isFold: false,
      exceedOneRow: false,
      buttonsList: [],
      configList: [],
      colHeight: '50',
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
    // 标签后面是否有冒号
    colon: {
      default: false,
      type: Boolean,
    },
    // 是否是搜索控件
    isSearchList: {
      default: false,
      type: Boolean,
    },
    // 按钮组配置
    formButtons: {
      default() {
        return []
      },
      type: Array,
    },
    // 按钮组尺寸
    buttonSize: {
      default: 'small',
      type: String,
    },
    // 是否是详情模式
    isDetail: {
      default: false,
      type: Boolean,
    },
  },
  //自定义指令
  directives: {
    // 监听元素宽度变化，用于地图自适应小
    resize: {
      bind(el, binding) {
        let width = '',
          height = ''
        function get() {
          const style = document.defaultView.getComputedStyle(el)
          if (width !== style.width || height !== style.height) {
            binding.value({ width, height })
          }
          width = style.width
          height = style.height
        }
        el.__vueReize__ = setInterval(get, 200)
      },
      unbind(el) {
        clearInterval(el.__vueReize__)
      },
    },
  },
  watch: {
    formConfigList: {
      handler() {
        const configList = deepClone(this.formConfigList)
        let remain = 0
        let total = 0
        configList.forEach((item, index) => {
          // 搜索模式下判断表单元素是否在最左边
          if (this.isSearchList) {
            const col = item.col || 6
            total += col
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
            return
          }
          // 判断是否需要初始化表单值
          !this.formData.hasOwnProperty(item.prop) &&
            this.$set(this.formData, item.prop, '')
        })
        this.configList = configList
      },
      immediate: true,
    },
    formButtons: {
      handler() {
        if (this.isSearchList) {
          this.buttonsList = [
            {
              method: 'search',
              label: '查询',
            },
            {
              method: 'reset',
              label: '重置',
              type: 'plain',
            },
            ...this.formButtons,
          ]
        } else {
          this.buttonsList = [...this.formButtons]
        }
      },
      immediate: true,
    },
  },
  computed: {
    rules() {
      let obj = {}
      const blurEletypes = ['el-input', 'el-input-number']
      this.formConfigList.forEach((fieldItem) => {
        if (fieldItem.required && !fieldItem.disabled) {
          obj[fieldItem.prop] = [
            {
              required: true,
              message: `请输入${fieldItem.label}`,
              trigger: 'change',
              // trigger: blurEletypes.includes(fieldItem.component)
              //   ? 'blur'
              //   : 'change',
            },
          ]
        }
        if (
          fieldItem.component === 'el-date-picker' ||
          fieldItem.component === 'el-time-select' ||
          fieldItem.component === 'el-time-picker'
        ) {
          if (
            fieldItem.required &&
            fieldItem.minTimeProp &&
            !fieldItem.disabled
          ) {
            const minField = fieldItem.minTimeProp
            obj[fieldItem.prop].push({
              validator: getMinValidator(fieldItem, this.formData[minField]),
              trigger: 'change',
            })
          }
          if (
            fieldItem.required &&
            fieldItem.maxTimeProp &&
            !fieldItem.disabled
          ) {
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
    showButtons() {
      return this.configList.length > 0
    },
  },
  mounted() {
    this.judgeOneRow()
    window.addEventListener('resize', this.judgeOneRow)
    this.cloneForm = deepClone(this.formData)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.judgeOneRow)
  },
  methods: {
    getPicker,
    getAttrs,
    // 表格内复选框变更
    fieldItemChange(fieldItem, row) {
      this.$emit('happenEvent', {
        buttonItem: { method: 'formFieldChange' },
        fieldItem,
        row,
      })
    },
    // 判断高度是否只有一行，从而隐藏折叠按钮
    judgeOneRow() {
      const el = this.$refs.wsForm
      let compareEle = el.getElementsByClassName('el-col')[0]
      if (!compareEle) compareEle = el.getElementsByClassName('el-row')[0]
      const compareHeight = compareEle.offsetHeight
      this.colHeight = compareHeight
      this.exceedOneRow = el.offsetHeight - 10 > compareHeight
    },
    // 集中处理事件
    happenEvent(buttonItem) {
      const { method } = buttonItem
      // method为reset则进行默认处理
      if (method === 'reset') {
        const obj = deepClone(this.cloneForm)
        this.$emit('update:formData', deepClone(obj))
        this.handleSearch()
        return
      }
      this.$emit('happenEvent', {
        buttonItem,
        formData: this.formData,
      })
    },
    handleSearch() {
      this.$emit('happenEvent', {
        buttonItem: { method: 'search' },
        formData: this.formData,
      })
    },
    // input框失焦处理
    handleBlur(row, fieldItem) {
      const { prop, blurHandler: handler } = fieldItem
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
.searchMode {
  /deep/ .el-form-item {
    margin-bottom: 18px;
    display: flex;
  }
  .notLeftMargin {
    /deep/ .el-form-item__label-wrap {
      margin-left: 0px !important;
    }
  }
  /deep/ .el-form-item__label-wrap {
    margin-left: 20px !important;
  }
  /deep/ .el-form-item__content {
    margin-left: 0 !important;
    flex: 1;
  }
  .searchMode-ws-buttons {
    margin-left: 40px;
    /deep/ .el-button + .el-button,
    .el-checkbox.is-bordered + .el-checkbox.is-bordered {
      margin-left: 0;
    }
    /deep/ .el-button {
      margin-right: 10px;
    }
  }
  /deep/ .el-form-item__error {
    white-space: nowrap;
  }
}
.render {
  /deep/ .el-row--flex {
    flex-wrap: wrap;
  }
  .fold-button {
    // margin-left: 10px;
    .fold-text {
      margin-right: 5px;
    }
  }
}
/deep/ .formMode-ws-buttons.el-form-item {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  /deep/ .el-form-item__content {
    margin-left: 0 !important;
  }
}
.fold {
  height: 50px;
  overflow: hidden;
  // /deep/ .el-form {
  //   transform: translateY(-100%) translateY(50px);
  // }
}
.searchMode .searchMode-list {
  margin-bottom: 0;
}
/deep/ .el-input.is-disabled .el-input__inner {
  color: #959090;
}
/deep/ .el-textarea.is-disabled .el-textarea__inner {
  color: #959090;
}
/deep/ .el-input-number {
  width: 100%;
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
