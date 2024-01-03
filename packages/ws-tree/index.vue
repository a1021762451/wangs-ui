<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-03 15:24:34
 * @LastEditors: wang shuai
 * @LastEditTime: 2024-01-03 15:47:02
-->
<template>
  <div class="tree-content" :style="{ backgroundColor }">
    <!-- 添加根节点按钮 -->
    <slot name="header">
      <div class="model-title" v-if="showHeader">
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
            <i
              class="el-icon-plus"
              style="cursor: pointer"
              @click="freeAdd"
            ></i>
          </el-tooltip>
        </span>
      </div>
    </slot>
    <!-- 搜索框 -->
    <el-input
      v-if="showSearch"
      placeholder="按关键字筛选"
      v-model="filterText"
      clearable
      size="small"
    ></el-input>
    <!-- 树主体 -->
    <div
      :class="textEllipsis ? 'container-textEllipsis' : 'tree-container'"
      ref="container"
    >
      <el-tree
        ref="tree"
        class="tree-ele"
        :style="{ backgroundColor }"
        @node-contextmenu="floderOption"
        v-bind="{
          'filter-node-method': excludeFirstSearch
            ? excludeFirstSearchFilterNode
            : filterNode,
          'expand-on-click-node': false,
          'highlight-current': true,
          ...$attrs,
          nodeKey,
          data: treeData,
        }"
        v-on="$listeners"
      >
        <template v-slot="{ data, node }">
          <slot name="treeNode" v-bind="{ data, node }">
            <div
              :class="
                nodeSpaceBetween ? 'custom-tree-node-flex' : 'custom-tree-node'
              "
              class="textEllipsis-tree-node"
              @mouseenter="mouseenter(data)"
              @mouseleave="mouseleave"
            >
              <!-- 内容 -->
              <wsTooltip :content="node.label" overflow :placement="'right'">
                <span class="custom-tree-label">
                  <slot v-bind="{ data, node }">
                    {{ node.label }}
                  </slot>
                </span>
              </wsTooltip>
              <!-- 悬浮按钮 -->
              <span
                class="custom-tree-button"
                v-if="changeByHover"
                :style="{
                  visibility: iAct == data ? 'visible' : 'hidden',
                }"
              >
                <template
                  v-for="item in filterButtonsFn(
                    operationsList,
                    data,
                    node,
                    'hover'
                  )"
                >
                  <span @click.stop v-if="item.children" :key="item.icon">
                    <el-dropdown
                      trigger="click"
                      size="small"
                      @command="
                        happenCommand($event, data, node, item.children)
                      "
                    >
                      <i :class="`${item.icon}`" :title="item.label"></i>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                          v-for="child in item.children"
                          :key="child.label"
                          :icon="child.icon"
                          :command="child.method"
                          @click.native.stop
                          >{{ child.label }}</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </el-dropdown>
                  </span>
                  <i
                    v-else
                    :key="item.icon"
                    @click.stop="happenEvent(data, node, item)"
                    :class="`${item.icon}`"
                    :title="item.label"
                  ></i>
                </template>
              </span>
              <!-- 禁用蒙层 -->
              <wsTooltip
                :content="node.label"
                :overflow="false"
                :placement="'top'"
              >
                <div
                  v-if="judgeDisabled(data, node)"
                  class="disabled"
                  @click.stop
                ></div>
              </wsTooltip>
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
        v-for="item in filterButtonsFn(
          operationsList,
          optionData,
          node,
          'contextMenu'
        )"
        :key="item.label"
        @click="happenEvent(optionData, node, item)"
        class="option-card-button"
        :icon="item.icon"
      >
        {{ item.label }}</el-button
      >
    </div>
  </div>
</template>

<script>
// 默认操作按钮
const defaultButtons = [
  {
    label: '新建',
    method: 'nodeAdd',
    icon: 'el-icon-plus',
  },
  {
    label: '删除',
    method: 'nodeDelete',
    icon: 'el-icon-delete',
  },
  {
    label: '编辑',
    method: 'nodeEdit',
    icon: 'el-icon-edit',
  },
]
import mixins from './mixins'
import wsTooltip from '../ws-tooltip/index.vue'
import { flatToTree, debounce } from '../utils/util.js'
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
      type: String | Array,
    },
    // 后续搜索 不被第一次的搜索操作影响
    excludeFirstSearch: {
      default: false,
      type: Boolean,
    },
    // 额外操作按钮
    extraOperations: {
      default: () => [],
      type: Array,
    },
    // 背景色
    backgroundColor: {
      default: '#fff',
      type: String,
    },
    // 树点击选中颜色
    activeColor: {
      default: '',
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
    // 是否显示头部
    showHeader: {
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
    // 数据是否扁平
    dataIsFlat: {
      default: true,
      type: Boolean,
    },
    // 结点是否禁用的回调函数
    disabledFn: {
      type: Function,
    },
    // 右键菜单是否禁用的回调函数
    disabledContextmenuFn: {
      type: Function,
    },
    // 过滤操作按钮
    filterButtonsFn: {
      type: Function,
      default(operationsList) {
        return operationsList
      },
    },
    // 数据
    data: {
      default: () => [],
      type: Array,
    },
    // 使用默认按钮
    useDefaultButtons: {
      default: true,
      type: Boolean,
    },
    // 当前选中节点
    currentNodeKey: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      optionCardX: '',
      optionCardY: '',
      optionCardShow: false,
      optionData: [],
      node: {},
      nodeRef: {},
      iAct: '',
      filterText: '',
      searchText: '',
      preCheckedKeys: [],
      alreadySet: false,
      operationsList: [],
      treeData: [],
      filterTextFn: debounce(this.filterTextCallback),
    }
  },
  computed: {
    // 树节点名称字段
    props() {
      // 默认属性值
      //  {
      //   firstSpellKey: undefined,
      //   label: 'label',
      //   children: 'children',
      //   parent: 'pid',
      // }
      return this.$attrs.props || {}
    },
    titleTip() {
      if (this.changeByHover && this.changeByContextMenu)
        return '鼠标右键或悬浮可进行编辑'
      if (this.changeByHover) return '鼠标悬浮可进行编辑'
      if (this.changeByContextMenu) return '鼠标右键可进行编辑'
      return ''
    },
    nodeKey() {
      return this.$attrs['node-key'] || this.$attrs['nodeKey'] || 'id'
    },
    changeByHover() {
      return this.changeMode.includes('hover')
    },
    changeByContextMenu() {
      return this.changeMode.includes('contextMenu')
    },
  },
  mounted() {
    if (this.changeByContextMenu) {
      const container = this.$refs.container
      container.addEventListener('scroll', this.scroll)
      document.addEventListener('click', this.OptionCardClose)
    }
    // todo：动态设置选中颜色
    // if (this.activeColor) {
    //   const treeEl = this.$refs.tree.$el
    //   console.log(treeEl, 'treeEl');
    //   const activeColorEl = treeEl.querySelector('.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content')
    //   console.log(activeColorEl, 'background-color');
    //   activeColorEl.style.backgroundColor = this.activeColor
    // }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.OptionCardClose)
  },
  watch: {
    filterText(val) {
      this.filterTextFn(val)
    },
    data: {
      handler() {
        const data = this.data || []
        this.treeData = this.dataIsFlat
          ? flatToTree(data, this.props, this.nodeKey)
          : data
        this.setCurrentKeyByProp()
      },
      immediate: true,
    },
    extraOperations: {
      handler: 'initButtons',
      immediate: true,
    },
    currentNodeKey: {
      handler() {
        this.setCurrentKeyByProp()
      },
      immediate: true,
    },
  },
  methods: {
    happenCommand(command, data, node, children) {
      const buttonItem = children.find((item) => item.method === command)
      this.$emit('happenEvent', {
        buttonItem,
        node,
        data,
      })
    },
    // 自动设置当前选中节点
    setCurrentKeyByProp() {
      this.currentNodeKey &&
        this.data.length &&
        this.$nextTick(() => {
          this.setCurrentKey(this.currentNodeKey)
        })
    },
    // 搜索框过滤回调
    filterTextCallback(val) {
      this.$emit('search', val)
      !this.noFilter && this.filter(val)
    },
    // 操作点击事件
    happenEvent(data, node, buttonItem) {
      this.optionCardShow = false
      this.$emit('happenEvent', {
        buttonItem,
        node,
        data,
      })
    },
    // 确认操作按钮列表
    initButtons() {
      const arr = this.useDefaultButtons ? defaultButtons : []
      this.operationsList = arr.concat(this.extraOperations)
    },
    // 右键菜单属性设置
    floderOption(e, data, node, nodeRef) {
      this.$emit('nodeContextmenu', e, data, node, nodeRef)
      if (this.judgeDisabledContextmenu(data, node)) return
      const clientHeight = document.documentElement.clientHeight
      this.optionCardShow = false
      this.optionCardX = e.x + 10
      // this.optionCardY = e.y + 10
      this.optionCardY = clientHeight - e.y
      this.optionData = data
      this.node = node
      this.nodeRef = nodeRef
      this.optionCardShow = true
    },
    // 判断节点是否禁用右键
    judgeDisabledContextmenu(data, node) {
      return (
        !this.changeByContextMenu ||
        (typeof this.disabledContextmenuFn === 'function' &&
          this.disabledContextmenuFn(data, node))
      )
    },
    // 判断节点是否禁用
    judgeDisabled(data, node) {
      // 方案一, 可以利用节点的属性进行判断，包括isLeaf等
      if (data.hasOwnProperty('disabled')) {
        return data.disabled
      }
      if (typeof this.disabledFn === 'function') {
        const disabled = this.disabledFn(data, node)
        this.$set(data, 'disabled', disabled)
        return disabled
      }
      return false
      // 方案二--放弃，因为不能利用节点属性
      //   if (!this.dataIsFlat) data = treeToFlat(data, this.props, this.nodeKey)
      //   data.forEach((item) => {
      //     // 自带disabled权限最高
      //     if (item.hasOwnProperty('disabled')) {
      //       return
      //     }
      //     // 有disabledFn则执行
      //     let disabled = false
      //     if (typeof this.disabledFn === 'function') {
      //       disabled = this.disabledFn(item, node)
      //     }
      //     this.$set(item, 'disabled', disabled)
      //   })
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
      if (!this.changeByHover) return
      this.iAct = data
    },
    mouseleave() {
      if (!this.changeByHover) return
      this.iAct = ''
    },
    // 自由新增
    freeAdd() {
      this.$emit('happenEvent', {
        buttonItem: { method: 'freeAdd' },
      })
    },
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
            this.setChecked(key, true)
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
      this.setChecked(data[this.nodeKey], condition)

      this.searchText = value
      return flag
    },
    // 迭代函数，如果字节点不满足条件，则判断父节点
    getHasKeyword(value, node) {
      const { firstSpellKey, label = 'label' } = this.props
      let data
      if (node.data instanceof Array) {
        // data = node.data.length > 0 ? node.data[0] : {}
        return false
      } else {
        data = node.data || {}
      }
      if (
        data[label].indexOf(value) !== -1 ||
        (firstSpellKey &&
          data[firstSpellKey] &&
          data[firstSpellKey].indexOf(value) !== -1)
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
  // width: 70px;
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
