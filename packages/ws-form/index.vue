<template>
  <div
    class="render"
    :class="{ fold: isFold, searchMode: isSearchList }"
    ref="wsForm"
  >
    <el-form
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
          v-for="fieldItem in formConfigList"
          :key="fieldItem.field"
        >
          <el-form-item :label="fieldItem.label" :prop="fieldItem.field">
            <div class="search-item_wrapper">
              <el-select
                clearable
                filterable
                v-if="fieldItem.type == '1'"
                v-model="formData[fieldItem.field]"
                :placeholder="fieldItem.disabled ? '' : '请选择'"
                :disabled="fieldItem.disabled"
                @change="changeSelect($event, fieldItem)"
              >
                <el-option
                  v-for="item in allOptions[fieldItem.field]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
              <el-input
                clearable
                v-else-if="fieldItem.type == '2'"
                v-model="formData[fieldItem.field]"
                :placeholder="fieldItem.disabled ? '' : '请输入内容'"
                :disabled="fieldItem.disabled"
              ></el-input>
              <el-input-number
                clearable
                v-else-if="fieldItem.type == '3'"
                v-model="formData[fieldItem.field]"
                :placeholder="fieldItem.disabled ? '' : '请输入数字'"
                :disabled="fieldItem.disabled"
                :min="(fieldItem.params && fieldItem.params.min) || 1"
                :max="(fieldItem.params && fieldItem.params.max) || 100"
                :step="(fieldItem.params && fieldItem.params.step) || 1"
                :precision="
                  (fieldItem.params && fieldItem.params.precision) || 0
                "
                :controls="false"
              >
              </el-input-number>
              <el-input
                clearable
                :maxlength="
                  (fieldItem.params && +fieldItem.params.maxlength) || 1000
                "
                show-word-limit
                v-else-if="fieldItem.type == '4'"
                type="textarea"
                v-model="formData[fieldItem.field]"
                :placeholder="fieldItem.disabled ? '' : '请输入内容'"
                :rows="2"
                :disabled="fieldItem.disabled"
              ></el-input>
              <el-date-picker
                clearable
                v-else-if="
                  fieldItem.type == '5' && fieldItem.timeType !== 'time'
                "
                v-model="formData[fieldItem.field]"
                :type="fieldItem.timeType"
                :value-format="fieldItem.valueFormat"
                :placeholder="fieldItem.disabled ? '' : '选择时间'"
                :picker-options="
                  getPicker(fieldItem, formData, globalMinDate, globalMaxDate)
                "
                :disabled="fieldItem.disabled"
              ></el-date-picker>
              <el-time-select
                clearable
                v-else-if="
                  fieldItem.type == '5' && fieldItem.timeType === 'time'
                "
                v-model="formData[fieldItem.field]"
                :placeholder="fieldItem.disabled ? '' : '选择时间'"
                :picker-options="
                  getPicker(fieldItem, formData, globalMinDate, globalMaxDate)
                "
                :disabled="fieldItem.disabled"
              ></el-time-select>
              <template v-else-if="fieldItem.slotName">
                <slot
                  :name="fieldItem.slotName"
                  :formData="formData"
                  :fieldItem="fieldItem"
                ></slot>
              </template>
            </div>
          </el-form-item>
        </el-col>
        <!-- 按钮 -->
        <el-form-item :class="isSearchList ? '' : 'formMode-ws-buttons'">
          <ws-buttons
            :buttonConfigList="buttonConfigList"
            class="searchMode-ws-buttons"
            @happenEvent="happenEvent"
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
import { deepClone, judgeTimeType, getPicker } from '../utils/util'
import wsButtons from '../componentes/ws-buttons.vue'
export default {
  name: 'ws-form',
  components: { wsButtons },
  data() {
    return {
      formData: {},
      cloneForm: {},
      isFold: false,
      exceedOneRow: false
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
    }
  },
  //自定义指令
  directives: {
    // 监听元素宽度变化，用于地图自适应小
    resize: {
      bind(el, binding) {
        let width = '',
          height = ''
        console.log('v-resize-bind', el)

        function get() {
          console.log('v-resize-get')

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
        // this.formData = {}
        this.formConfigList.forEach((item) => {
          if (!this.isDetail) {
            if (this.defaultForm[item.field] !== undefined) {
              this.$set(this.formData, item.field, this.defaultForm[item.field])
            } else {
              this.$set(this.formData, item.field, '')
            }
          }
          // 时间控件类型判断
          if (item.type === '5') {
            item.timeType = this.judgeTimeType(item.valueFormat)
          }
        })
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
    }
  },
  computed: {
    isDetail() {
      return Object.keys(this.fatherForm).length
    },
    rules() {
      let obj = {}
      this.formConfigList.forEach((item) => {
        if (item.required && !item.disabled) {
          obj[item.field] = [
            { required: true, message: `请输入${item.label}`, trigger: 'blur' }
          ]
        }
        const params = item.params
        if (params && params.minTime && !item.disabled) {
          const minField = params.minTime
          obj[item.field].push({
            validator: (rule, value, callback) => {
              console.log(this, 'validator')
              if (
                +this.dayjs(value).valueOf() <=
                +this.dayjs(this.form[minField]).valueOf()
              ) {
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
          obj[item.field].push({
            validator: (rule, value, callback) => {
              console.log(this, 'validator')
              if (
                +this.dayjs(value).valueOf() >=
                +this.dayjs(this.form[maxField]).valueOf()
              ) {
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
    judgeTimeType,
    getPicker,
    // 判断高度是否只有一行，从而隐藏折叠按钮
    judgeOneRow() {
      const el = this.$refs.wsForm
      window.wsForm = el
      this.exceedOneRow = el.offsetHeight > 40
    },
    // 集中处理事件
    happenEvent(buttonItem) {
      this.$emit('happenEvent', {
        buttonItem,
        formData: this.formData
      })
    },
    // 下拉框变更
    changeSelect(value, fieldItem) {
      if (fieldItem.field === 'type' && value) {
        this.formData = {}
        this.$emit('changeType', value)
      }
    },
    // 下拉树失焦
    treeSelectBlur($event, refName) {
      console.log($event, refName, '$event, refName')
      console.log(this.$refs[refName], 'this.$refs[refName]')
      console.log(this.$refs[refName].$emit, 'this.$refs[refName].$emit')
      this.$refs[refName].$emit('el.form.blur', $event)
    },
    // 保存按钮
    confirm() {
      this.$refs.formRef.validate((valid) => {
        const formData = deepClone(this.formData)
        if (valid) this.$emit('confirm', formData, this)
      })
    },
    // 下拉框选项确认
    async filterList(field) {
      let res = null
      res = this.allOptions[field]
      return res
    }
  }
}
</script>

<style lang="less" scoped>
.searchMode {
  /deep/ .el-form-item {
    margin-bottom: 0;
  }
  .searchMode-ws-buttons {
    /deep/ .el-button + .el-button,
    .el-checkbox.is-bordered + .el-checkbox.is-bordered {
      margin-left: 0;
    }
    /deep/ .el-button {
      margin-right: 10px;
    }
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
  /deep/ .el-form {
    transform: translateY(-100%) translateY(50px);
  }
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
</style>
