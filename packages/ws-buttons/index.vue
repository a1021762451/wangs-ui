<!--
 * @Author: wanns 1021762451@qq.com
 * @Date: 2023-03-15 19:36:28
 * @LastEditors: wang shuai
 * @LastEditTime: 2024-03-04 17:22:26
 * @FilePath: \ws-ui\packages\componentes\ws-buttons.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="button-col" @click.stop>
    <slot name="prefix"></slot>
    <template v-for="buttonItem in filterButtons(buttonConfigList)">
      <slot
        v-if="buttonItem.slotName"
        :name="buttonItem.slotName"
        :method="buttonItem.method"
        :buttonItem="buttonItem"
      ></slot>
      <el-dropdown
        v-else-if="buttonItem.children"
        :key="buttonItem.method + buttonItem.label + buttonItem.icon"
        :size="buttonSize"
        trigger="click"
        @command="happenCommand($event, buttonItem.children)"
      >
        <component
          :is="buttonItem.component || (isLinkButton ? 'el-link' : 'el-button')"
          class="button-item"
          v-bind="{
            size: buttonSize,
            type: 'primary',
            underline: false,
            ...buttonItem,
          }"
        >
          {{ buttonItem.label }}
        </component>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="child in buttonItem.children"
            :key="child.label"
            :icon="child.icon"
            :command="child.method"
            @click.native.stop
            >{{ child.label }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
      <component
        v-else
        :is="buttonItem.component || (isLinkButton ? 'el-link' : 'el-button')"
        class="button-item"
        :key="buttonItem.method + buttonItem.label + buttonItem.icon"
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
    <slot name="suffix"></slot>
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
    // 过滤操作按钮
    filterButtons: {
      default(buttonConfigList) {
        return buttonConfigList
      },
      type: Function,
    },
  },
  methods: {
    happenCommand(command, children) {
      const buttonItem = children.find((item) => item.method === command)
      this.$emit('happenEvent', buttonItem)
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .el-link {
  margin-right: 6px;
}
</style>
