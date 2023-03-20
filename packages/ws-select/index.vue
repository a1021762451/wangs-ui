<!-- 组件特点
1.有默认选项使用默认选项， 有默认值使用默认值
2.无默认值，无默认选项，则懒加载获取选项
3.可以根据搜索值本地过滤选项，也可以根据搜索值实时接口过滤选项
4.兼容el-form组件
5.兼容el-select组件原有属性和事件
6.选项存入vuex中，通过prop字段取值，实现选项接口调用一次功能
 -->

<template>
  <el-select
    v-model="ownValue"
    clearable
    filterable
    :remote="true"
    :remote-method="remoteMethod"
    :loading="loading"
    :placeholder="$attrs.disabled ? '' : '请选择'"
    @focus="selectFocus"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
    </el-option>
  </el-select>
</template>

<script>
import { deepClone } from '../utils/util'
export default {
  name: 'ws-select',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    // 封装的接口请求对象，axios等
    request: {
      type: Function,
    },
    // 对请求进行特殊处理，需要返回options
    requestHandler: {
      type: Function,
    },
    // 接口配置
    requestConfig: {
      default() {
        return {
          url: '',
          method: 'get',
          params: {},
          data: {},
        }
      },
      type: Object,
    },
    // 默认值
    value: {
      default: '',
      type: String | Number | Array,
    },
    // 使用options第几个作为默认数据 -- 非必传
    defaultIndex: {
      type: Number | String,
      default: -1,
    },
    // 默认选项，有则不使用接口
    defaultOptions: {
      type: Array,
      default() {
        return []
      },
    },
    // label和value字段在数据中的映射字段
    props: {
      default() {
        return {
          label: 'label',
          value: 'value',
        }
      },
    },
    // 实时搜索 - 重要属性，为真功能类似el-autocomplete
    isActualTime: {
      default: false,
      type: Boolean,
    },
    // vuex allOptions取值键名
    prop: {
      type: String,
      default: '',
    },
  },
  watch: {
    defaultOptions: {
      handler(newValue) {
        this.options = newValue
        this.cloneOptions = deepClone(newValue)
      },
      immediate: true,
    },
    value: {
      handler(newValue) {
        this.ownValue = newValue
      },
      immediate: true,
    },
    // 请求变更，重新初始化
    requestConfig: {
      handler(newValue) {
        this.options = []
      },
      deep: true,
    },
  },
  data() {
    return {
      ownValue: '',
      options: [],
      cloneOptions: [],
      loading: false,
    }
  },
  created() {
    this.init()
  },
  computed: {
    // 有没有默认值
    hasDefaultValue() {
      return (
        (Array.isArray(this.value) && this.value.length) ||
        (!Array.isArray(this.value) && this.value)
      )
    },
    allOptions() {
      return this.$store.state.allOptions
    },
  },
  methods: {
    // 初始化选项
    async init() {
      const hasOptions = this.options.length
      // 实时则清空选项
      if (this.isActualTime) {
        this.options = []
        return
      }
      // state中allOptions有，则使用
      if (this.allOptions[this.prop] && !hasOptions) {
        this.options = this.allOptions[this.prop]
      }
      // 有默认值索引，，按索引取默认值
      if (this.defaultIndex !== -1) {
        if (!hasOptions) await this.getOpitons()
        this.ownValue = this.options[this.defaultIndex]
          ? this.options[this.defaultIndex].value
          : ''
        this.$emit('change', this.ownValue)
      }
      // 有默认值并且没有选项，则获取远程选项
      if (this.hasDefaultValue && !hasOptions) this.getOpitons()
    },
    // 获取选项的接口调用
    async getOpitons(query) {
      this.loading = true
      const { label: labelField, value: valueField } = this.props
      // 获取request,没有直接返回
      const request = window.request || this.request
      if (!request) return []
      let arr = []
      // 优先使用接口处理逻辑
      if (this.requestHandler) {
        arr = await this.requestHandler(
          this.requestConfig,
          query,
          labelField,
          valueField
        )
      } else {
        const res = await request(this.requestConfig)
        const data = res.data
        arr = data.map((item) => {
          return {
            label: item[labelField],
            value: item[valueField],
          }
        })
      }
      this.loading = false
      this.options = arr
      this.cloneOptions = deepClone(arr)
      this.$store.commit('setAllOptions', {
        prop: this.prop,
        options: deepClone(arr),
      })
      return arr
      // this.$store.setAllOptions()
    },
    // 远程搜索
    async remoteMethod(query) {
      const { label: labelField } = this.props
      if (this.isActualTime) {
        this.$emit('queryChange', query)
        // 实时状态远程过滤
        if (!query) {
          this.options = []
        } else {
          this.getOpitons(query)
        }
      } else {
        // 非实时状态本地过滤
        if (!this.cloneOptions.length) {
          this.getOpitons()
        } else {
          if (!query) {
            this.options = this.cloneOptions
            return
          }
          this.options = this.cloneOptions.filter((item) => {
            return item[labelField].includes(query)
          })
        }
      }
    },
    // 监听聚焦状态，如果是非实时状态，聚焦时也进行远程搜索
    selectFocus() {
      if (!this.isActualTime) {
        this.remoteMethod()
      }
    },
  },
}
</script>

<style lang="less" scoped></style>
