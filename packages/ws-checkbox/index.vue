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
        v-model="isCheckAll"
        @change="toggleAllSelection"
      ></el-checkbox>
    </div>
    <wsCheckboxItem
      v-for="(item, index) in data"
      v-model="item.value"
      :key="item.name + String(index)"
      :props="props"
      @change="handleChange"
      @indeterminateChange="
        (params) => {
          $emit('indeterminateItemChange', { ...params, $index: index })
        }
      "
      v-bind="{
        ...item,
        ...$attrs,
      }"
    ></wsCheckboxItem>
  </div>
</template>

<script>
import wsCheckboxItem from './components/ws-checkbox-item'
import mixins from './mixins'
export default {
  name: 'ws-checkbox',
  components: { wsCheckboxItem },
  mixins: [mixins],
  props: {
    // 全选方式
    selectAllMode: {
      default: 'checkbox',
      type: String,
    },
  },
  methods: {
    init() {
      // 动态添加value属性
      this.data.forEach((item) => {
        const itemAllId = item.data.map((item) => item[this.valueKey])
        const arr = this.judgeArrayContain(this.value, itemAllId)
        this.$set(item, 'value', arr)
      })
      this.judgeIsIndeterminate()
    },
    // 判断数组包含关系
    judgeArrayContain(father, son) {
      const arr = father.filter((item) => {
        return son.includes(item)
      })
      return arr
    },
    // 处理变更
    handleChange() {
      const arr = []
      this.data.forEach((item) => {
        arr.push(...item.value)
      })
      this.$emit('change', arr)
    },
    // 是否全选
    toggleAllSelection(flag) {
      const arr = flag
        ? [...this.noChangeCheckedValue, ...this.changeValue]
        : [...this.noChangeCheckedValue]
      this.$emit('change', arr)
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
