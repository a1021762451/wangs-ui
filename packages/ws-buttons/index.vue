<!--
 * @Author: wanns 1021762451@qq.com
 * @Date: 2023-03-15 19:36:28
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-09-21 15:06:18
 * @FilePath: \ws-ui\packages\componentes\ws-buttons.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="button-col">
    <template v-for="buttonItem in buttonConfigList">
      <slot
        v-if="buttonItem.slotName"
        :name="buttonItem.slotName"
        :buttonItem="buttonItem"
      ></slot>
      <component
        v-else
        :is="buttonItem.component || (isLinkButton ? 'el-link' : 'el-button')"
        class="button-item"
        :key="buttonItem.method + buttonItem.label"
        v-bind="{
          size: buttonSize,
          type: 'primary',
          underline: false,
          ...buttonItem,
        }"
        @click="$emit('happenEvent', buttonItem)"
      >
        {{ buttonItem.label }}
      </component>
    </template>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ws-buttons',
  props: {
    // 按钮配置数组
    buttonConfigList: {
      type: Array,
      default() {
        return []
      },
    },
    // 判断按钮模式，el-link / el-button   优先级没有component属性高
    isLinkButton: {
      type: Boolean,
      default: false,
    },
    // 按钮组尺寸
    buttonSize: {
      default: 'small',
      type: String,
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .el-link {
  margin-right: 6px;
}
</style>
