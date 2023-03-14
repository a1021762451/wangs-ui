<template>
  <div
    class="render"
    :class="{ fold: isFold, searchMode: isSearchList }"
    :style="{ height: isFold ? colHeight + 1 + 'px' : undefined }"
    ref="wsForm"
  >
    <el-form
      :style="{
        transform: isFold
          ? `translateY(-100%) translateY(${colHeight + 1}px)`
          : undefined
      }"
      ref="formRef"
      label-width="auto"
      :model="formData"
      :rules="rules"
      :validate-on-rule-change="false"
      :size="size"
    >
      <el-row :gutter="12" type="flex">
        <!-- 表单元素 -->
        <el-col
          :span="fieldItem.col || 6"
          v-for="fieldItem in configList"
          :key="fieldItem.prop"
        >
          <el-form-item
            v-bind="fieldItem"
            :class="{ notLeftMargin: fieldItem.isSide && isSearchList }"
            :style="{
              marginBottom: isSearchList
                ? Object.keys(rules).length
                  ? '18px'
                  : '5px'
                : undefined
            }"
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
              v-bind="
                getAttrs(fieldItem, formData, globalMinDate, globalMaxDate)
              "
              v-model="formData[fieldItem.prop]"
              @change="fieldItemChange(fieldItem, formData)"
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
          :class="isSearchList ? '' : 'formMode-ws-buttons'"
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
import { deepClone, getPicker, getAttrs } from '../utils/util'
import wsButtons from '../componentes/ws-buttons.vue'
export default {
  name: 'ws-form',
  components: { wsButtons },
  data() {
    return {
      formData: {},
      cloneForm: {},
      isFold: false,
      exceedOneRow: false,
      buttonsList: [],
      configList: [],
      colHeight: '50'
    }
  },
  props: {
    // 表单元素配置数组
    formConfigList: {
      default() {
        return []
      },
      type: Array
    },
    // 下拉框选项配置数组
    allOptions: {
      default() {
        return {}
      },
      type: Object
    },
    // 详情数据，覆盖form
    fatherForm: {
      default() {
        return {}
      },
      type: Object
    },
    // 按钮分割距离
    buttonsCol: {
      default: 24,
      type: Number
    },
    // 按钮组配置
    buttonConfigList: {
      default() {
        return []
      },
      type: Array
    },
    // 表单尺寸
    size: {
      default: 'medium',
      type: String
    },
    // 表单默认值
    defaultForm: {
      default() {
        return {}
      },
      type: Object
    },
    // 是否是搜索控件
    isSearchList: {
      default: false,
      type: Boolean
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
    // 按钮组尺寸
    buttonSize: {
      default: 'small',
      type: String
    },
    // 标签后面是否有冒号
    colon: {
      default: false,
      type: Boolean
    }
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
      }
    }
  },
  watch: {
    formConfigList: {
      handler() {
        const configList = deepClone(this.formConfigList)
        let remain = 0
        let total = 0
        configList.forEach((item, index) => {
          const col = item.col || 6
          total += col
          const newRemain = Math.floor((total - 1) / 24)
          if (newRemain !== remain || index === 0) {
            this.$set(item, 'isSide', true)
            remain = newRemain
          }
          if (!this.isDetail) {
            if (this.defaultForm[item.prop] !== undefined) {
              this.$set(this.formData, item.prop, this.defaultForm[item.prop])
            } else {
              this.$set(this.formData, item.prop, '')
            }
          }
        })
        this.configList = configList
      },
      immediate: true
    },
    fatherForm: {
      handler() {
        if (Object.keys(this.fatherForm).length) {
          this.formData = this.fatherForm
        }
      },
      immediate: true
    },
    buttonConfigList: {
      handler() {
        if (this.isSearchList) {
          this.buttonsList = [
            {
              method: 'search',
              label: '查看'
            },
            {
              method: 'reset',
              label: '重置',
              type: 'plain'
            },
            ...this.buttonConfigList
          ]
        } else {
          this.buttonsList = [...this.buttonConfigList]
        }
      },
      immediate: true
    }
  },
  computed: {
    isDetail() {
      return Object.keys(this.fatherForm).length
    },
    rules() {
      let obj = {}
      const blurEletypes = ['el-input', 'el-input-number']
      this.formConfigList.forEach((item) => {
        if (item.required && !item.disabled) {
          obj[item.prop] = [
            {
              required: true,
              message: `请输入${item.label}`,
              trigger: blurEletypes.includes(item.component) ? 'blur' : 'change'
            }
          ]
        }
        const params = item.params
        if (params && params.minTime && !item.disabled) {
          const minField = params.minTime
          obj[item.prop].push({
            validator: (rule, value, callback) => {
              if (+new Date(value) <= +new Date(this.form[minField])) {
                callback(new Error('请注意时间先后'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          })
        }
        if (params && params.maxTime && !item.disabled) {
          const maxField = params.maxTime
          obj[item.prop].push({
            validator: (rule, value, callback) => {
              if (+new Date(value) >= +new Date(this.form[maxField])) {
                callback(new Error('请注意时间先后'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          })
        }
      })
      return obj
    },
    showButtons() {
      return this.configList.length > 0
    }
  },
  mounted() {
    this.$nextTick(this.judgeOneRow)
    window.addEventListener('resize', this.judgeOneRow)
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
        buttonItem: { method: 'fieldItemChange', fieldItem },
        row
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
        this.formData = { ...this.formData, ...this.defaultForm }
        this.$emit('happenEvent', {
          buttonItem: { method: 'search' },
          formData: this.formData
        })
        return
      }
      this.$emit('happenEvent', {
        buttonItem,
        formData: this.formData
      })
    },
    // 下拉框变更
    changeSelect(value, fieldItem) {
      this.$emit('changeSelect', value, fieldItem)
    },
    // 下拉框选项确认
    async filterList(prop) {
      let res = null
      res = this.allOptions[prop]
      return res
    }
  }
}
</script>

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
