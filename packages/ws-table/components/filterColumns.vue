<template>
  <el-dialog title="显示的列" :visible.sync="dialogVisable">
    <ws-checkbox
      v-model="defaultCheckedData"
      :data="checkboxData"
      :span="8"
      allowCheckAll
      ref="wsCheckbox"
    ></ws-checkbox>
    <div class="operation">
      <el-button type="primary" size="mini" @click="confirm">确认</el-button>
      <el-button size="mini" @click="cancel">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>  
// import wsCheckbbox from '../../ws-checkbox/index'
export default {
  name: 'filterColumns',
  components: {
    wsCheckbox: () => {
      try {
        return require('../../ws-checkbox/index')
      } catch (error) {
        console.log('没有找到包')
      }
    },
  },
  data() {
    return {
      checkboxData: [
        {
          name: '全选',
          data: [],
        },
      ],
      defaultCheckedData: [],
      dialogVisable: false,
    }
  },
  created() {
    this.init()
  },
  props: {
    columns: {
      default() {
        return []
      },
      type: Array,
    },
    originColunms: {
      default() {
        return []
      },
      type: Array,
    },
  },
  methods: {
    // 初始化
    init() {
      let data = this.handleData(this.originColunms)
      data = this.sortData(data)
      this.checkboxData[0].data = data
      this.defaultCheckedData = this.handleData(this.columns, true)
    },
    // 数据排序
    sortData(data) {
      const arr = []
      const specialArr = []
      const alwaysVisibleArr = []
      data.forEach((item) => {
        if (/type_(.*)/.test(item.value)) {
          specialArr.push(item)
          return
        }
        if (item.disabled) {
          alwaysVisibleArr.push(item)
          return
        }
        arr.push(item)
      })
      return [...specialArr, ...alwaysVisibleArr, ...arr]
    },
    // 迭代处理列数据
    handleData(dataList, isGetValue = false) {
      const typeLableMap = {
        selection: '勾选列',
        index: '索引列',
        expand: '折叠功能',
        operation: '操作列',
      }
      const arr = []
      const specialArr = []
      const alwaysVisibleArr = []
      dataList.forEach((item) => {
        const { type, label, prop, children } = item
        if (children) {
          arr.push(...this.handleData(children, isGetValue))
          return
        }
        if (type) {
          const value = isGetValue
            ? `type_${type}`
            : {
                label: typeLableMap[type],
                value: `type_${type}`,
                disabled: item.alwaysVisible,
              }
          specialArr.push(value)
          return
        }
        if (prop) {
          const value = isGetValue
            ? prop
            : {
                label: item.label__table,
                value: prop,
                disabled: item.alwaysVisible,
              }
          item.alwaysVisible ? alwaysVisibleArr.push(value) : arr.push(value)
          return
        }
      })
      return [...specialArr, ...alwaysVisibleArr, ...arr]
    },
    // 确认
    confirm() {
      this.$emit('filterColumnsConfirm', this.defaultCheckedData)
    },
    // 取消
    cancel() {
      this.dialogVisable = false
    },
  },
}
</script>

<style lang="less" scoped>
.operation {
  display: flex;
  justify-content: center;
}
</style>
