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
      :defaultCheckedData="defaultCheckedDataAfter"
      :props="props"
      :noChangeCheckedValues="getNoChangeCheckedValues(item.data)"
      :noChangeNoCheckedValues="getNoChangeNoCheckedValues(item.data)"
      :allowChangeValues="getAllowChangeValues(item.data)"
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
      checkedData: [],
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
    labelField() {
      return this.props.label
    },
    valueField() {
      return this.props.value
    },
    // 不允许变更的已勾选数据
    noChangeCheckedValues() {
      const arr = []
      this.checkboxData.forEach((item) => {
        const subarr = this.getNoChangeCheckedValues(item.data)
        arr.push(...subarr)
      })
      return arr
    },
    // 允许变更的数据
    allowChangeValues() {
      const arr = []
      this.checkboxData.forEach((item) => {
        const subarr = this.getAllowChangeValues(item.data)
        arr.push(...subarr)
      })
      return arr
    },
  },
  methods: {
    init() {
      this.defaultCheckedDataAfter = deepClone(this.defaultCheckedData)
      this.checkedData = deepClone(this.defaultCheckedData)
      this.judgeIsIndeterminate()
    },
    // 处理变更
    handleChange(checkedData, notCheckedData) {
      // 需要添加的
      checkedData.forEach((item) => {
        const findInd = this.checkedData.findIndex(
          (nextitem) => item === nextitem
        )
        findInd == -1 && this.checkedData.push(item)
      })
      // 需要删除的
      notCheckedData.forEach((item) => {
        const findInd = this.checkedData.findIndex(
          (nextitem) => item === nextitem
        )
        findInd !== -1 && this.checkedData.splice(findInd, 1)
      })
      this.judgeIsIndeterminate()
      this.$emit('handleChange', {
        checkAll: this.checkAll,
        isIndeterminate: this.isIndeterminate,
      })
    },
    // 是否全选
    toggleAllSelection(state) {
      this.checkedData = state
        ? [...this.noChangeCheckedValues, ...this.allowChangeValues]
        : [...this.noChangeCheckedValues]
      this.defaultCheckedDataAfter = deepClone(this.checkedData)
      this.isIndeterminate = false
    },
    // 获取勾选id
    getAllCheckedValues() {
      return this.checkedData
    },
    // 获取勾选项
    getAllCheckedItems() {
      const arr = []
      this.checkboxData.forEach((item) => {
        item.data.forEach((nextitem) => {
          if (this.checkedData.includes(nextitem[this.valueField])) {
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
          if (this.checkedData.includes(nextitem[this.valueField])) {
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
      let checkedCount = this.checkedData.filter((item) => {
        return this.allowChangeValues.includes(item)
      }).length
      const needCount = this.allowChangeValues.length
      this.checkAll = checkedCount === needCount
      this.isIndeterminate = checkedCount > 0 && checkedCount < needCount
    },
    // 获取不允许变更的已勾选数据
    getNoChangeCheckedValues(data) {
      if (!this.defaultCheckedData.length) return []
      return this.getValues(
        data,
        (item) =>
          item.disabled &&
          this.defaultCheckedData.includes(item[this.valueField])
      )
    },
    // 获取不允许变更的未勾选数据
    getNoChangeNoCheckedValues(data) {
      if (!this.defaultCheckedData.length) return []
      return this.getValues(
        data,
        (item) =>
          item.disabled &&
          !this.defaultCheckedData.includes(item[this.valueField])
      )
    },
    // 获取允许变更的数据
    getAllowChangeValues(data) {
      return this.getValues(data, (item) => !item.disabled)
    },
    // 获取data中的值
    getValues(data, conditionFn) {
      return data
        .filter((item) => {
          return conditionFn(item)
        })
        .map((item) => {
          return item[this.valueField]
        })
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
