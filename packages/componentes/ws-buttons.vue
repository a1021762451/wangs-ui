<template>
  <div class="button-col">
    <template v-for="buttonItem in buttonsList">
      <slot
        v-if="buttonItem.slotName"
        :name="buttonItem.slotName"
        :buttonItem="buttonItem"
      ></slot>
      <el-link
        v-else-if="isLinkButton"
        class="button-item"
        :size="size"
        :underline="false"
        :key="buttonItem.name"
        v-bind="buttonItem"
        @click="$emit('happenEvent', buttonItem)"
        >{{ buttonItem.label }}</el-link
      >
      <el-button
        v-else
        class="button-item"
        :key="buttonItem.label"
        :size="size"
        v-bind="buttonItem"
        @click="$emit('happenEvent', buttonItem)"
        >{{ buttonItem.label }}</el-button
      >
    </template>
    <slot></slot>
  </div>
</template>

<script>
import { deepClone } from '../utils/util'
export default {
  name: 'ws-buttons',
  props: {
    // 按钮配置数组
    buttonConfigList: {
      type: Array,
      default() {
        return []
      }
    },
    // 判断按钮模式，el-link / el-button
    isLinkButton: {
      type: Boolean,
      default: false
    },
    // 按钮组尺寸
    size: {
      default: 'small',
      type: String
    }
  },
  computed: {
    buttonsList() {
      const arr = deepClone(this.buttonConfigList)
      arr.forEach((item) => {
        item.type = item.type || 'primary'
      })
      return arr
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-link {
  margin-right: 6px;
}
</style>
