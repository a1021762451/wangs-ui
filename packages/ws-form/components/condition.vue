<template>
  <div class="conditon">
    <div v-for="item in value" :key="item.label" class="conditon-item">
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
      <template v-else>
        <span class="item-value">{{ item.value }}</span>
      </template>
      <div class="item-remove" @click="removeTag(item)">
        <i class="el-icon-close"></i>
      </div>
    </div>
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
    removeTag(item) {
      const { prop } = item
      const newValue = deepClone(this.value)
      const index = newValue.findIndex((condition) => condition.prop === prop)
      newValue.splice(index, 1)
      this.$emit('change', newValue)
      this.$emit('remove-tag', item)
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
