<template>
  <div
    :style="contextmenuStyle"
    class="contextmenu"
    v-show="visible"
    ref="contextmenu"
  >
    <slot name="contextmenu"></slot>
    <ws-buttons
      class="ws-buttons-option"
      :buttonConfigList="buttonConfigList"
      @happenEvent="happenEvent"
      v-bind="$attrs"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
        <slot :name="name" v-bind="scope"></slot>
      </template>
    </ws-buttons>
  </div>
</template>

<script>
import wsButtons from '../ws-buttons'
export default {
  name: 'ws-contextmenu',
  components: { wsButtons },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    buttonConfigList: {
      type: Array,
      default: () => [],
    },
    placement: {
      type: String,
      default: 'top-end',
    },
  },
  data() {
    return {
      left: '',
      bottom: '',
      contextmenuStyle: {},
    }
  },
  mounted() {
    document.addEventListener('click', this.contextmenuClose)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.contextmenuClose)
  },
  created() {},
  methods: {
    // 操作点击事件
    happenEvent(buttonItem) {
      this.$emit('update:visible', false)
      this.$emit('happenEvent', buttonItem)
    },
    // 点击框外区域 隐藏菜单
    contextmenuClose(event) {
      var currentCli = this.$refs.contextmenu
      if (currentCli && !currentCli.contains(event.target)) {
        //点击到了以外的区域，就隐藏菜单
        this.$emit('update:visible', false)
      }
    },
    // 右键菜单属性设置
    contextmenuOpen({ x, y }) {
      const clientHeight = document.documentElement.clientHeight
      const clientWidth = document.documentElement.clientWidth
      const contextmenuStyle = {}
      if (this.placement === 'top-end') {
        contextmenuStyle.left = `${x}px`
        contextmenuStyle.bottom = `${clientHeight - y}px`
      }
      if (this.placement === 'bottom-end') {
        contextmenuStyle.left = `${x}px`
        contextmenuStyle.top = `${y}px`
      }
      if (this.placement === 'top-start') {
        contextmenuStyle.right = `${clientWidth - x}px`
        contextmenuStyle.bottom = `${clientHeight - y}px`
      }
      if (this.placement === 'bottom-start') {
        contextmenuStyle.right = `${clientWidth - x}px`
        contextmenuStyle.top = `${y}px`
      }
      this.contextmenuStyle = contextmenuStyle
      this.$emit('update:visible', true)
    },
  },
}
</script>

<style lang="less" scoped>
.contextmenu {
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  z-index: 99;
  position: fixed;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  .option-card-button {
    width: 100%;
    margin-left: 0 !important;
    font-size: 10px;
    border-radius: 0;
    padding: 8px 10px;
  }
}
/deep/ .ws-buttons-option {
  display: flex;
  flex-direction: column;
  .el-button {
    width: 100%;
    margin-left: 0 !important;
    font-size: 10px;
    border-radius: 0;
    padding: 8px 10px;
  }
}
</style>
