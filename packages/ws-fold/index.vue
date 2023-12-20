<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-04-20 11:54:48
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-12-20 10:30:52
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
    <div class="content">
      <slot></slot>
    </div>
    <!-- 折叠按钮 -->
    <template v-if="allowCollapse"> </template>
    <div
      class="asideStow"
      @click="toggleCollapse(!collapsed)"
      v-if="allowCollapse"
    >
      <slot name="collapse" :collapsed="collapsed">
        <div class="collapsedContainer">
          <slot name="collapseIcon" :collapsed="collapsed">
            <i v-if="collapsed" class="el-icon-arrow-right"></i>
            <i v-else class="el-icon-arrow-left"></i>
          </slot>
        </div>
      </slot>
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
  watch: {
    width() {
      this.changeWidth()
    },
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
      this.width = collapsed
        ? this.minwidth
        : this.defaultWidth || this.maxwidth
    },
    // 变更宽度
    changeWidth() {
      // 保存宽度
      sessionStorage.setItem(this.storageKey, this.width)
      // 判断是否折叠
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
  background-color: #f0f0f0;
  margin-right: 12px;
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
  overflow: hidden;
}
.asideStow {
  position: absolute;
  right: 0px;
  top: 50%;
  z-index: 100;
  transform: translateX(100%) translateY(-50%);
  cursor: pointer;
}
.collapsedContainer {
  width: 12px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #a1a5ad;
  font-size: 12px;
  border-radius: 0px 7px 7px 0px;
}
</style>
