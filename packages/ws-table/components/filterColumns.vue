<template>
  <el-dialog title="" :visible.sync="dialogVisable" width="30%" @close="">
    <ws-checkbox
      :defaultCheckedData="defaultCheckedData"
      :checkboxData="checkboxData"
      :span="6"
      ref="wsCheckbox"
    ></ws-checkbox>
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
          data: [],
        },
      ],
      defaultCheckedData: [],
    }
  },
  created() {
    this.init()
  },
  props: {
    dialogVisable: {
      default: false,
      type: Boolean,
    },
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
      let data = []
      const typeLableMap = {
        selection: '勾选列',
        index: '索引列',
        selection: '折叠功能',
        operation: '操作列',
      }
      console.log(data, 'data')
      data = this.handleData()
      this.checkboxData[0].data = data
      console.log(data, 'data')
    },
    // 迭代处理列数据
    handleData() {
      this.tableColumns
        .filter((item) => {
          // return item.type === 'operation' || !item.type
          return true
        })
        .map((item) => {
          const { type, label, prop } = item
          if (type) {
            return {
              label: typeLableMap[type],
              id: `type_${type}`,
              disabled: item.display,
            }
          }
          if (label) {
            return {
              label,
              id: prop,
              disabled: item.display,
            }
          }
        })
      this.defaultCheckedData = this.columns.map((item) => {
        const { type, label, prop } = item
        if (type) {
          return `type_${type}`
        }
        if (label) {
          return prop
        }
      })
    },
  },
}
</script>

<style lang="less" scoped></style>
