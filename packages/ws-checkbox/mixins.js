export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    // 总的数据
    data: {
      type: Array,
      default() {
        return []
      },
    },
    // 默认被勾选的数据
    value: {
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
  },
  data() {
    return {
      // 是否全选
      isCheckAll: false,
      // 是否半选
      isIndeterminate: false,
    }
  },
  watch: {
    // 根据被勾选的数据判断
    value() {
      this.init()
    },
  },
  created() {
    this.init()
  },
  methods: {
    // 单项获取不允许变更的已勾选数据
    getNoChangeCheckedValue(data) {
      if (!this.value.length) return []
      return this.getValue(
        data,
        (item) => item.disabled && this.value.includes(item[this.valueKey])
      )
    },
    // 单项获取不允许变更的未勾选数据
    getNoChangeNoCheckedValue(data) {
      if (!this.value.length) return []
      return this.getValue(
        data,
        (item) => item.disabled && !this.value.includes(item[this.valueKey])
      )
    },
    // 单项获取允许变更的数据
    getChangeValue(data) {
      return this.getValue(data, (item) => !item.disabled)
    },
    // 按条件获取data中的值
    getValue(data, conditionFn) {
      return data
        .filter((item) => {
          return conditionFn(item)
        })
        .map((item) => {
          return item[this.valueKey]
        })
    },
    // 判断全选状态
    judgeIsIndeterminate() {
      let checkedCount = this.value.filter((item) => {
        return this.changeValue.includes(item)
      }).length
      const needCount = this.changeValue.length
      this.isCheckAll = checkedCount === needCount
      this.isIndeterminate = checkedCount > 0 && checkedCount < needCount
      this.$emit('indeterminateChange', {
        isIndeterminate: this.isIndeterminate,
        isCheckAll: this.isCheckAll,
      })
    },
    // 获取各种数据中间函数
    getComputedValue(callback) {
      if (this.data[0].data) {
        const arr = []
        this.data.forEach((item) => {
          const subarr = this[callback](item.data, this.value)
          arr.push(...subarr)
        })
        return arr
      }
      return this[callback](this.data, this.allValue)
    },
  },
  computed: {
    // 不允许变更的已勾选数据
    noChangeCheckedValue() {
      return this.getComputedValue('getNoChangeCheckedValue')
    },
    // 不允许变更的未勾选数据
    noChangeNoCheckedValue() {
      return this.getComputedValue('getNoChangeNoCheckedValue')
    },
    // 允许变更的数据
    changeValue() {
      return this.getComputedValue('getChangeValue')
    },
    labelKey() {
      return this.props.label
    },
    valueKey() {
      return this.props.value
    },
  },
}
