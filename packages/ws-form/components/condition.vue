<template>
  <div class="conditon">
    <template v-for="item in value">
      <div v-if="judgeExist(item)" :key="item.label" class="conditon-item">
        <span class="item-label"> {{ item.label }}： </span>
        <template v-if="Array.isArray(item.value)">
          <span
            class="item-value"
            v-for="(nextitem, nextindex) in item.value"
            :key="nextitem.label"
          >
            {{ nextitem.label }}
            {{ item.value.length === nextindex + 1 ? '' : ',' }}
          </span>
        </template>
        <span v-else class="item-value">{{ item.value }}</span>
        <div class="item-remove" @click="removeTag(item)">
          <i class="el-icon-close"></i>
        </div>
      </div>
    </template>
    <el-link type="primary" :underline="false" @click="clear">清空条件</el-link>
  </div>
</template>

<script>
import { deepClone } from '../../utils/util'
export default {
  name: 'condition',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    // 判断值是否存在
    judgeExist({ value }) {
      const valueIsArray = Array.isArray(value)
      const valueExist =
        (valueIsArray && value.length) || (!valueIsArray && value)
      return valueExist
    },
    // 移除
    removeTag(item) {
      const { prop } = item
      const findItem = this.value.findIndex(
        (condition) => condition.prop === prop
      )
      const valueIsArray = Array.isArray(findItem.value)
      findItem.value = valueIsArray ? [] : ''
      this.$emit('change', this.value)
      this.$emit('remove-tag', item)
    },
    clear() {
      this.value.forEach((item) => {
        const valueIsArray = Array.isArray(item.value)
        item.value = valueIsArray ? [] : ''
      })
      this.$emit('change', this.value)
      this.$emit('clear')
    },
  },
}
</script>

<style lang="less" scoped>
.conditon {
  // padding: 10px 0;
  line-height: initial;
  .conditon-item {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 4px;
    background: #f3fafb;
    font-size: 12px;
    border: 1px solid #489393;
    color: #666;
    height: 24px;
    line-height: 24px;
    padding: 0 3px;
    .item-remove {
      cursor: pointer;
      display: inline-block;
      border-radius: 50%;
      margin-left: 5px;
      padding: 1px;
      background: #2faf9c;
      color: white;
      text-align: center;
      width: 14px;
      height: 14px;
      font-size: 12px;
      line-height: 14px;
    }
    // .item-remove:hover {
    //   background: #2faf9c;
    //   color: white;
    // }
  }
}
</style>
