<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-03 15:24:34
 * @LastEditors: wang shuai
 * @LastEditTime: 2024-02-04 09:27:02
-->
<template>
  <div class="tree-content" :style="{ backgroundColor }">
    <!-- 添加根节点按钮 -->
    <slot name="header">
      <div class="model-title" v-if="showHeader">
        <span class="model-title-left" v-if="title">
          <span>{{ title }}</span>
          <el-tooltip
            v-if="titleTip"
            effect="dark"
            placement="top"
            :content="titleTip"
          >
            <i class="el-icon-info"></i>
          </el-tooltip>
        </span>
        <span class="model-title-right" v-if="addTip">
          <el-tooltip effect="dark" placement="top" :content="addTip">
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
      v-model="filterText"
      v-bind="{
        clearable: true,
        placeholder: '按关键字筛选',
        size: 'small',
        ...(headerConfig.searchAttrs || {}),
      }"
    ></el-input>
    <!-- 树主体 -->
    <div
      :class="
        showOverflowTooltip ? 'container-showOverflowTooltip' : 'tree-container'
      "
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
              class="showOverflowTooltip-tree-node custom-tree-node-flex"
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
                <ws-buttons
                  class="ws-buttons"
                  isLinkButton
                  :buttonConfigList="
                    getButtonConfigList(operationsList, data, node, 'hover')
                  "
                  @happenEvent="happenEvent(data, node, $event)"
                >
                  <template
                    v-for="(index, name) in $scopedSlots"
                    v-slot:[name]="scope"
                  >
                    <slot :name="name" v-bind="scope"></slot>
                  </template>
                </ws-buttons>
              </span>
              <!-- 禁用蒙层 -->
              <wsTooltip
                :content="node.label"
                :overflow="false"
                :placement="'right'"
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
      <ws-buttons
        class="ws-buttons-option"
        :buttonConfigList="
          getButtonConfigList(
            operationsList,
            optionData,
            optionData,
            'contextMenu'
          )
        "
        @happenEvent="happenEvent(optionData, node, $event)"
      >
        <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
          <slot :name="name" v-bind="scope"></slot>
        </template>
      </ws-buttons>
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
    label: '编辑',
    method: 'nodeEdit',
    icon: 'el-icon-edit',
  },
  {
    label: '删除',
    method: 'nodeDelete',
    icon: 'el-icon-delete',
  },
]
import mixins from './mixins'
import wsTooltip from '../ws-tooltip/index.vue'
import wsButtons from '../ws-buttons/index.vue'
import { flatToTree, debounce, getObjAttr } from '../utils/util.js'
export default {
  name: 'ws-tree',
  mixins: [mixins],
  components: {
    wsTooltip,
    wsButtons,
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
    // 头部内容配置  title/titleTip/addTip/searchAttrs
    headerConfig: {
      default: () => ({
        // title: '',
        // addTip: '',
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
    showOverflowTooltip: {
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
      optionNode: {},
      optionNodeRef: {},
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
      if (this.headerConfig.hasOwnProperty('titleTip'))
        return this.headerConfig.titleTip
      if (this.changeByHover && this.changeByContextMenu)
        return '鼠标右键或悬浮可进行编辑'
      if (this.changeByHover) return '鼠标悬浮可进行编辑'
      if (this.changeByContextMenu) return '鼠标右键可进行编辑'
      return ''
    },
    addTip() {
      return this.headerConfig.hasOwnProperty('addTip')
        ? this.headerConfig.addTip
        : '添加根节点'
    },
    title() {
      return this.headerConfig.hasOwnProperty('title')
        ? this.headerConfig.title
        : '类型'
    },
    nodeKey() {
      return getObjAttr(this.$attrs, 'nodeKey') || 'id'
    },
    changeByHover() {
      return this.changeMode.includes('hover')
    },
    changeByContextMenu() {
      return this.changeMode.includes('contextMenu')
    },
    optionCardButtons() {
      if (!this.changeByContextMenu) return []
      const optionCardButtons = optionCardButtons.forEach((item) => {
        this.$set(item, 'type', 'default')
      })
      return optionCardButtons
    },
  },
  mounted() {
    if (this.changeByContextMenu) {
      const container = this.$refs.container
      container.addEventListener('scroll', this.scroll)
      document.addEventListener('click', this.OptionCardClose)
    }
  },
  beforeDestroy() {
    if (this.changeByContextMenu) {
      const container = this.$refs.container
      container.removeEventListener('scroll', this.scroll)
    }
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
    // 获取过滤后的按钮
    getButtonConfigList(operationsList, data, node, type) {
      let buttonConfigList =
        this.filterButtonsFn(operationsList, data, node, type) || []
      if (type === 'hover') {
        return buttonConfigList.map((item) => ({
          ...item,
          label: '',
        }))
      }
      if (type === 'contextMenu') {
        return buttonConfigList.map((item) => ({ ...item, type: 'default' }))
      }
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
      this.optionNode = node
      this.optionNodeRef = nodeRef
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
  .container-showOverflowTooltip {
    overflow: auto;
    border: none;
    flex: 1;
    margin-top: 4px;
    .showOverflowTooltip-tree-node {
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
/deep/ .ws-buttons {
  .el-link:not(:last-child) {
    margin-right: 2px;
  }
  span.el-link--inner {
    margin-left: 0;
  }
  margin-right: 0;
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
