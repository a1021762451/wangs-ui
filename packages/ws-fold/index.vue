<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-04-20 11:54:48
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-10-23 16:46:44
-->
<template>
  <div
    class="resizable"
    ref="container"
    :style="{
      width: width + 'px',
      paddingRight: width ? '4px' : '0px',
    }"
  >
    <!-- 组件内容 -->
    <slot></slot>
    <!-- 折叠按钮 -->
    <div class="asideStow" @click="toggleCollapse(!collapsed)" v-if="allowCollapse">
      <i v-if="collapsed" class="el-icon-arrow-right"></i>
      <i v-else class="el-icon-arrow-left"></i>
    </div>
    <!-- 右侧拖拽区域 -->
    <div class="resize-handle" @mousedown="startResize" v-if="allowDrag"></div>
  </div>
</template>

<script>
export default {
  name: 'ws-fold',
  props: {
    // 最小宽度
    minwidth: {
      type: Number,
      default: 100,
    },
    // 最大宽度
    maxwidth: {
      type: Number,
      default: 600,
    },
    // 允许拖拽
    allowDrag: {
      type: Boolean,
      default: true,
    },
    // 允许折叠
    allowCollapse: {
      type: Boolean,
      default: true,
    },
    // 存储key
    storageKey: {
      type: String,
      default: 'ws-fold',
    },
    // 默认宽度
    defaultWidth: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      width:
        sessionStorage.getItem(this.storageKey) ||
        this.defaultWidth ||
        this.maxwidth, // 组件宽度
      collapsed: false, // 折叠状态
    }
  },
  created() {
    this.changeWidth()
  },
  methods: {
    // 开始拖拽
    startResize(event) {
      event.preventDefault()
      document.addEventListener('mousemove', this.resize, false)
      document.addEventListener('mouseup', this.stopResize, false)
    },
    // 结束拖拽
    stopResize() {
      document.removeEventListener('mousemove', this.resize, false)
      document.removeEventListener('mouseup', this.stopResize, false)
    },
    // 拖拽中
    resize(event) {
      const container = this.$refs.container
      const width = event.clientX - container.offsetLeft
      this.width = Math.max(this.minwidth, Math.min(this.maxwidth, width))
    },
    // 切换折叠状态
    toggleCollapse(collapsed) {
      this.collapsed = collapsed
      this.width = this.collapsed
        ? this.minwidth
        : this.defaultWidth || this.maxwidth
      this.$emit('collapse', this.collapsed)
    },
    // 变更宽度
    changeWidth() {
      sessionStorage.setItem(this.storageKey, this.width)
      const collapsed = this.width == this.minwidth
      if (collapsed != this.collapsed) {
        this.collapsed = collapsed
        this.$emit('collapse', this.collapsed)
      }
    },
  },
}
</script>

<style scoped>
.resizable {
  position: relative;
  height: 100%;
  /* background-color: #f0f0f0; */
}
.resize-handle {
  position: absolute;
  top: 0;
  right: -2px;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
  z-index: 1;
}
.content {
  height: 100%;
  width: 100%;
}
.asideStow {
  font-size: 12px;
  width: 12px;
  max-height: 44px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  background: #a1a5ad;
  border-radius: 0px 7px 7px 0px;
  cursor: pointer;
  position: absolute;
  right: -12px;
  z-index: 100;
}
</style>
