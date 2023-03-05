<template>
  <div class="button-col">
    <template v-for="buttonItem in buttonConfigList">
      <slot
        v-if="buttonItem.slotName"
        :name="buttonItem.slotName"
        :buttonItem="buttonItem"
      ></slot>
      <el-link
        v-else-if="isLinkButton"
        type="primary"
        class="button-item"
        size="small"
        :key="buttonItem.name"
        :underline="false"
        @click="$emit('happenEvent', buttonItem)"
        >{{ buttonItem.label }}</el-link
      >
      <el-button
        v-else
        :key="buttonItem.label"
        :type="buttonItem.type || 'primary'"
        class="button-item"
        :size="buttonItem.size || 'small'"
        :loading="buttonItem.loading"
        :icon="buttonItem.icon"
        @click="$emit('happenEvent', buttonItem)"
        >{{ buttonItem.label }}</el-button
      >
    </template>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'renderButtons',
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
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-link {
  margin-right: 6px;
}
</style>
