<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-03 15:24:34
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-06-15 16:50:28
-->
<template>
  <div class="tree-content" :style="{ backgroundColor }">
    <!-- 添加根节点按钮 -->
    <div class="model-title" v-if="changeMode">
      <span class="model-title-left">
        <span>{{ headerConfig.title }}</span>
        <el-tooltip
          effect="dark"
          placement="top"
          :content="headerConfig.titleTip || titleTip"
        >
          <i class="el-icon-info"></i>
        </el-tooltip>
      </span>
      <span class="model-title-right">
        <el-tooltip
          effect="dark"
          placement="top"
          :content="headerConfig.addTip"
        >
          <i class="el-icon-plus" style="cursor: pointer" @click="freeAdd"></i>
        </el-tooltip>
      </span>
    </div>
    <div class="model-title" v-if="!changeMode && showTitle">
      <span class="model-title-left">
        <span>{{ headerConfig.title }}</span>
      </span>
    </div>
    <!-- 搜索框 -->
    <el-input
      v-if="showSearch"
      placeholder="按关键字筛选"
      v-model="filterText"
      clearable
      size="small"
    ></el-input>
    <!-- 树主体 -->

    <div :class="textEllipsis ? 'container-textEllipsis' : 'tree-container'">
      <el-tree
        ref="tree"
        class="tree-ele"
        highlight-current
        :style="{ backgroundColor }"
        :filter-node-method="
          excludeFirstSearch ? excludeFirstSearchFilterNode : filterNode
        "
        @node-contextmenu="floderOption"
        v-bind="{
          'expand-on-click-node': false,
          ...$attrs,
        }"
        v-on="$listeners"
      >
        <template v-slot="{ node, data }">
          <slot v-bind="{ node, data }">
            <div
              :class="
                nodeSpaceBetween ? 'custom-tree-node-flex' : 'custom-tree-node'
              "
              class="textEllipsis-tree-node"
              @mouseenter="mouseenter(data)"
              @mouseleave="mouseleave"
            >
              <wsTooltip
                :content="node.label"
                overflow
                :placement="changeMode === 'hover' ? 'top' : 'right'"
              >
                <span class="custom-tree-label">{{ node.label }}</span>
              </wsTooltip>
              <span
                class="custom-tree-button"
                v-if="changeMode === 'hover'"
                :style="{
                  visibility: iAct == data ? 'visible' : 'hidden',
                }"
              >
                <i
                  v-for="item in operationsList"
                  :key="item.value"
                  @click.stop="happenEvent(node, data, item)"
                  :class="`${item.class}`"
                  :title="item.label"
                ></i>
              </span>
              <div v-if="data.disabled" class="disabled" @click.stop></div>
            </div>
          </slot>
        </template>
      </el-tree>
    </div>
    <!-- 右键菜单栏 -->
    <div
      :style="{
        left: optionCardX + 'px',
        bottom: optionCardY + 'px',
      }"
      class="contextmenu"
      v-show="optionCardShow"
      id="option-button-group"
    >
      <el-button
        v-for="item in operationsList"
        :key="item.value"
        @click="happenEvent(node, optionData, item)"
        :class="`option-card-button ${item.class}`"
      >
        {{ item.label }}</el-button
      >
    </div>
  </div>
</template>

<script>
// 防抖
export const debounce = (fn, t) => {
  const delay = t || 500
  let timer
  return function () {
    const args = arguments
    if (timer) {
      console.log('防抖中')
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, args)
    }, delay)
  }
}

import mixins from './mixins'
import wsTooltip from '../ws-tooltip/index.vue'
export default {
  name: 'ws-tree',
  mixins: [mixins],
  components: {
    wsTooltip,
  },
  props: {
    // 增删改查模式
    changeMode: {
      default: '', // contextMenu / hover
      type: String,
    },
    // 后续搜索 不被第一次的搜索操作影响
    excludeFirstSearch: {
      default: false,
      type: Boolean,
    },
    // 有哪些按钮
    operations: {
      default: () => ['add', 'delete', 'edit'],
      type: Array,
    },
    // 背景色
    backgroundColor: {
      default: '#fff',
      type: String,
    },
    // 节点内容和按钮之间的布局是否采取flex SpaceBetween布局
    nodeSpaceBetween: {
      default: true,
      type: Boolean,
    },
    // 头部内容配置
    headerConfig: {
      default: () => ({
        title: '类型',
        addTip: '添加根节点',
      }),
      type: Object,
    },
    // 是否显示标题 结合changeMode使用
    showTitle: {
      default: false,
      type: Boolean,
    },
    // 是否显示搜索框
    showSearch: {
      default: true,
      type: Boolean,
    },
    // 是否需要进行过滤， 通常结合远程搜索使用
    noFilter: {
      default: false,
      type: Boolean,
    },
    // 是否取消横向滚动，文字超出部分显示省略号，悬浮显示文字
    textEllipsis: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      optionCardX: '',
      optionCardY: '',
      optionCardShow: false,
      optionData: [],
      node: null,
      tree: null,
      iAct: '',
      filterText: '',
      searchText: '',
      preCheckedKeys: [],
      alreadySet: false,
      operationsList: [],
      filterTextFn: debounce(this.filterTextCallback),
    }
  },
  computed: {
    // 树节点名称字段
    props() {
      return this.$attrs.props || {}
    },
    labelKey() {
      return this.props.label || 'label'
    },
    // 首拼字段
    firstSpellKey() {
      return this.props.firstSpellKey
    },
    titleTip() {
      return this.changeMode === 'contextMenu'
        ? '鼠标右键可进行编辑'
        : this.changeMode === 'hover'
        ? '鼠标悬浮可进行编辑'
        : ''
    },
    nodeKey() {
      return this.$attrs['node-key'] || 'id'
    },
  },
  created() {
    this.filterOperations()
  },
  mounted() {
    if (this.changeMode === 'contextMenu') {
      document.addEventListener('click', this.OptionCardClose)
      const tree = document.getElementsByClassName('el-tree')[0]
      tree.addEventListener('scroll', this.scroll)
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.OptionCardClose)
  },
  watch: {
    filterText(val) {
      this.filterTextFn(val)
    },
  },
  methods: {
    filterTextCallback(val) {
      this.$emit('search', val)
      !this.noFilter && this.$refs.tree.filter(val)
    },
    // 操作点击事件
    happenEvent(node, data, item) {
      const { method } = item
      this[method](node, data)
    },
    // 过滤操作按钮
    filterOperations() {
      const operationsList = [
        {
          label: '新建',
          value: 'add',
          method: 'nodeAdd',
          class: 'el-icon-plus',
        },
        {
          label: '删除',
          value: 'delete',
          method: 'nodeDelete',
          class: 'el-icon-delete',
        },
        {
          label: '编辑',
          value: 'edit',
          method: 'nodeEdit',
          class: 'el-icon-edit',
        },
      ]
      const arr = []
      this.operations.forEach((item) => {
        const finditem = operationsList.find((i) => i.value === item)
        if (finditem) {
          arr.push(finditem)
        }
      })
      this.operationsList = arr
    },
    // 右键菜单属性设置
    floderOption(e, data, n, t) {
      console.log(e, data, n, t, 'floderOption')
      if (this.changeMode !== 'contextMenu') return
      const clientHeight = document.documentElement.clientHeight
      this.optionCardShow = false
      this.optionCardX = e.x + 10
      // this.optionCardY = e.y + 10
      this.optionCardY = clientHeight - e.y
      this.optionData = data
      this.node = n
      this.tree = t
      this.optionCardShow = true
    },
    // 滚动隐藏菜单
    scroll() {
      this.optionCardShow = false
    },
    // 点击框外区域 隐藏菜单
    OptionCardClose(event) {
      var currentCli = document.getElementById('option-button-group')
      if (currentCli) {
        if (!currentCli.contains(event.target)) {
          //点击到了id为option-button-group以外的区域，就隐藏菜单
          this.optionCardShow = false
        }
      }
    },
    // 鼠标悬浮
    mouseenter(data) {
      if (this.changeMode !== 'hover') return
      this.iAct = data
    },
    mouseleave() {
      if (this.changeMode !== 'hover') return
      this.iAct = ''
    },
    // 新增
    nodeAdd(node, data) {
      this.$emit('nodeAdd', data)
    },
    // 修改
    nodeEdit(node, data) {
      this.$emit('nodeEdit', data)
    },
    // 节点删除
    nodeDelete(node, data) {
      this.$emit('nodeDelete', data)
    },
    // 自由新增
    freeAdd() {
      this.$emit('freeAdd')
    },
    // // 对复选操作进行防抖处理 -- 为了实现特殊过滤效果
    // handleCheckChange: debounce(function (data, isChecked, isSubCheckeds) {
    //   // 防抖处理了，参数已经没有太大意义
    //   this.$emit('check-change', data, isChecked, isSubCheckeds)
    // }, 300),
    // handleNodeClick(data, node, el) {
    //   this.$emit('node-click', data, node, el)
    // },
    // // 允许拖拽
    // handleDrop(draggingNode, dropNode, dropType, ev) {
    //   this.$emit('handleDrop', draggingNode, dropNode, dropType, ev)
    // },
    // 默认过滤函数
    filterNode(value, data, node) {
      if (!value) return true
      // debugger
      const res = this.getHasKeyword(value, node)
      return res
    },
    // 改造成功 -- 效果是每搜一次，搜索结果保留之前的有的，其他清空，搜索值清空后，又还原成最初的状态
    excludeFirstSearchFilterNode(value, data, node) {
      // 树搜索框有值变无值，则还原之前的勾选，alreadySet控制只执行一次
      if (!value) {
        // console.log('树搜索框有值变无值');
        !this.alreadySet &&
          this.preCheckedKeys.forEach((key) => {
            this.$refs.tree.setChecked(key, true)
          })
        this.alreadySet = true
        this.preCheckedKeys = []
        this.searchText = ''
        return true
      } else {
        // console.log('处理所有有值的情况');
        this.alreadySet = false
      }
      // 树搜索框无值变有值，清空勾选，并记录之前的勾选  --- 执行一次
      if (!this.searchText && value) {
        // console.log('树搜索框无值变有值=---', this.getCheckedKeys());
        this.preCheckedKeys = this.getCheckedKeys()
      }
      const flag = this.getHasKeyword(value, node)
      const index = this.preCheckedKeys.findIndex((item) => {
        return item === data[this.nodeKey]
      })
      const condition = flag && index !== -1
      this.$refs.tree.setChecked(data[this.nodeKey], condition)

      this.searchText = value
      return flag
    },
    // 迭代函数，如果字节点不满足条件，则判断父节点
    getHasKeyword(value, node) {
      let data
      if (node.data instanceof Array) {
        // data = node.data.length > 0 ? node.data[0] : {}
        return false
      } else {
        data = node.data || {}
      }
      if (
        data[this.labelKey].indexOf(value) !== -1 ||
        (this.firstSpellKey &&
          data[this.firstSpellKey] &&
          data[this.firstSpellKey].indexOf(value) !== -1)
      ) {
        return true
      } else {
        return node.parent && this.getHasKeyword(value, node.parent)
      }
    },
  },
}
</script>

<style lang="less" scoped>
.contextmenu {
  width: 70px;
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
    padding: 8px 0px;
  }
}
.tree-content {
  height: 100%;
  width: 100%;
  padding: 5px 3px;
  display: flex;
  flex-direction: column;
  .model-title {
    height: 30px;
    position: relative;
    .model-title-left {
      position: absolute;
      left: 4px;
      top: 50%;
      transform: translateY(-50%);
    }
    .model-title-right {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .container-textEllipsis {
    overflow: auto;
    border: none;
    flex: 1;
    margin-top: 4px;
    .textEllipsis-tree-node {
      width: 100%;
      overflow: hidden;
      display: flex;
    }
    .custom-tree-label {
      display: block;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // 树横向滚动条方案一 ---- 外部容器滚动
  .tree-container {
    overflow: auto;
    border: none;
    flex: 1;
    margin-top: 4px;
    /deep/ .el-tree {
      display: inline-block;
      min-width: 100%;
    }
    .tree-ele {
      height: 100%; /*这里要比上面小一点，不然节点就几行就出现纵向滚动条*/
      /* overflow: auto;这个貌似要去掉，不然会出现双滚动条*/
      border: none;
    }
    .custom-tree-node {
      flex: 1;
      .custom-tree-button {
        // position: absolute;
        // right: 0;
        // z-index: 10;
        padding-left: 10px;
        padding-right: 5px;
      }
    }
    .custom-tree-node-flex {
      flex: 1;
      display: flex;
      justify-content: space-between;
      .custom-tree-button {
        padding: 0 5px;
      }
    }
  }
}
.custom-tree-button {
  i {
    padding: 2px;
    color: #66b1ff;
  }
}
.disabled {
  cursor: not-allowed;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 11;
}
/deep/ .el-tree-node__content {
  position: relative;
}
// 树横向滚动条方案一 ---- 树组件滚动
.tree-selfoverflow {
  overflow: auto;
  flex: 1;
  /deep/ .el-tree-node > .el-tree-node__children {
    overflow: visible;
  }
}
</style>
