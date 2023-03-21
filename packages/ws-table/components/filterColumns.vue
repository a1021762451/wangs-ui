<template>
  <el-dialog title="显示的列" :visible.sync="dialogVisable">
    <ws-checkbox
      :defaultCheckedData="defaultCheckedData"
      :checkboxData="checkboxData"
      :span="8"
      allowControl
      ref="wsCheckbox"
    ></ws-checkbox>
    <div class="operation">
      <el-button type="primary" size="mini" @click="confirm">确认</el-button>
      <el-button size="mini" @click="cancel">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import wsCheckbbox from '../../ws-checkbox/index'
export default {
  name: 'filterColumns',
  components: {
    wsCheckbbox,
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
    tableColumns: {
      default() {
        return []
      },
      type: Array,
    },
  },
  methods: {
    // 初始化
    init() {
      this.checkboxData[0].data = this.handleData(this.tableColumns)
      this.defaultCheckedData = this.handleData(this.columns, '', true)
    },
    // 迭代处理列数据
    handleData(dataList, fatherLabel = '', isGetValue = false) {
      fatherLabel = fatherLabel ? `${fatherLabel}-` : ''
      const typeLableMap = {
        selection: '勾选列',
        index: '索引列',
        expand: '折叠功能',
        operation: '操作列',
      }
      const arr = []
      const specialArr = []
      dataList.forEach((item) => {
        const { type, label, prop, childrens } = item
        if (childrens) {
          arr.push(
            ...this.handleData(childrens, `${fatherLabel}` + label, isGetValue)
          )
          return
        }
        if (type) {
          const value = isGetValue
            ? `type_${type}`
            : {
                label: typeLableMap[type],
                value: `type_${type}`,
                disabled: item.display,
              }
          specialArr.push(value)
          return
        }
        if (prop) {
          const value = isGetValue
            ? prop
            : {
                label: `${fatherLabel}` + label,
                value: prop,
                disabled: item.display,
              }
          arr.push(value)
          return
        }
      })
      return [...specialArr, ...arr]
    },
    // 确认
    confirm() {
      const wsCheckbox = this.$refs.wsCheckbox
      const values = wsCheckbox.getAllCheckedValues()
      this.$emit('filterColumnsConfirm', values)
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
