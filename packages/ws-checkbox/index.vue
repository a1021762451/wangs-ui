<template>
  <div>
    <div v-if="selectAllMode === 'button'" class="inner-text center-header">
      <el-button type="primary" size="mini" @click="toggleAllSelection(true)"
        >全选</el-button
      >
      <el-button type="primary" size="mini" @click="toggleAllSelection(false)"
        >取消全选</el-button
      >
    </div>
    <div class="inner-text center-header" v-if="selectAllMode === 'checkbox'">
      <span class="title">全选</span>
      <el-checkbox
        :indeterminate="isIndeterminate"
        v-model="checkAll"
        @change="toggleAllSelection"
      ></el-checkbox>
    </div>
    <wsCheckboxItem
      v-for="(item, index) in checkboxData"
      :key="index"
      :defaultCheckedData="defaultCheckedData"
      :props="props"
      @change="handleChange"
      v-bind="{
        ...item,
        ...$attrs,
      }"
    ></wsCheckboxItem>
  </div>
</template>

<script>
import { deepClone } from '../utils/util'
import wsCheckboxItem from './components/ws-checkbox-item'
export default {
  name: 'ws-checkbox',
  components: { wsCheckboxItem },
  data() {
    return {
      allCheckedData: [],
      defaultCheckedDataAfter: [],
      isIndeterminate: false,
      checkAll: false,
    }
  },
  props: {
    // 所有数据
    checkboxData: {
      type: Array,
      default() {
        return []
      },
    },
    // 初始化数据
    defaultCheckedData: {
      type: Array,
      default() {
        return []
      },
    },
    // 全选方式
    selectAllMode: {
      default: '',
      type: String,
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
  watch: {
    // 根据被勾选的数据判断
    defaultCheckedData() {
      this.init()
    },
  },
  created() {
    this.init()
  },
  computed: {
    allId() {
      const ids = []
      this.checkboxData.forEach((item) => {
        item.data.forEach((nextitem) => {
          ids.push(nextitem[this.valueField])
        })
      })
      return ids
    },
    labelField() {
      return this.props.label
    },
    valueField() {
      return this.props.value
    },
  },
  methods: {
    init() {
      this.allCheckedData = deepClone(this.defaultCheckedData)
      let checkedCount = this.allCheckedData.length
      this.checkAll = checkedCount === this.allId.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.allId.length
    },
    // 处理变更
    handleChange(checkedData, notCheckedData) {
      // 需要添加的
      checkedData.forEach((item) => {
        const findInd = this.allCheckedData.findIndex(
          (nextitem) => item === nextitem
        )
        findInd == -1 && this.allCheckedData.push(item)
      })
      // 需要删除的
      notCheckedData.forEach((item) => {
        const findInd = this.allCheckedData.findIndex(
          (nextitem) => item === nextitem
        )
        findInd !== -1 && this.allCheckedData.splice(findInd, 1)
      })
      this.judgeIsIndeterminate()
      this.$emit('handleChange', {
        checkAll: this.checkAll,
        isIndeterminate: this.isIndeterminate,
      })
    },
    // 是否全选
    toggleAllSelection(state) {
      this.allCheckedData = state ? deepClone(this.allId) : []
      this.defaultCheckedDataAfter = deepClone(this.allCheckedData)
      this.isIndeterminate = false
    },
    // 获取勾选id
    getAllCheckedValues() {
      return this.allCheckedData
    },
    // 获取勾选项
    getAllCheckedItems() {
      const arr = []
      this.checkboxData.forEach((item) => {
        item.data.forEach((nextitem) => {
          if (this.allCheckedData.includes(nextitem[this.valueField])) {
            arr.push(nextitem)
          }
        })
      })
      return arr
    },
    // 按组获取勾选id
    getAllCheckedValuesByGroup(isIds = true) {
      const groub = []
      this.checkboxData.forEach((item) => {
        const items = []
        item.data.forEach((nextitem) => {
          if (this.allCheckedData.includes(nextitem[this.valueField])) {
            items.push(isIds ? nextitem[this.valueField] : nextitem)
          }
        })
        groub.push({
          name: item.name,
          data: items,
        })
      })
      return groub
    },
    // 按组获取勾选项
    getAllCheckedItemsByGroup() {
      return this.getAllCheckedValuesByGroup(false)
    },
    // 判断全选状态
    judgeIsIndeterminate() {
      let checkedCount = this.allCheckedData.length
      this.checkAll = checkedCount === this.allId.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.allId.length
    },
  },
}
</script>

<style lang="less" scoped>
.title {
  margin-right: 10px;
}
.center-header {
  display: flex;
  justify-content: center;
  align-items: center;
}
.inner-text {
  margin-bottom: 5px;
}
</style>
