<template>
  <div class="tree-content">
    <!-- 添加根节点按钮 -->
    <div class="model-title" v-if="changeMode">
      <el-tooltip effect="dark" placement="top" :content="content">
        <i class="el-icon-info"></i>
      </el-tooltip>
      <el-tooltip effect="dark" placement="right" content="添加根节点">
        <i class="el-icon-plus" style="cursor: pointer" @click="freeAdd"></i>
      </el-tooltip>
    </div>
    <!-- 搜索框 -->
    <el-input
      placeholder="输入关键字进行过滤"
      v-model="filterText"
      size="small"
    ></el-input>
    <!-- 树主体 -->
    <el-tree
      ref="tree"
      class="tree"
      node-key="id"
      default-expand-all
      highlight-current
      :props="treeProps"
      :filter-node-method="
        excludeFirstSearch ? excludeFirstSearchFilterNode : filterNode
      "
      :data="treeData"
      :expand-on-click-node="false"
      :show-checkbox="showCheckBox"
      :draggable="draggable"
      :allow-drop="allowDrop"
      :allow-drag="allowDrag"
      @node-drop="handleDrop"
      @check-change="handleCheckChange"
      @node-click="handleNodeClick"
      @node-contextmenu="floderOption"
    >
      <div
        class="custom-tree-node"
        slot-scope="{ node, data }"
        @mouseenter="mouseenter(data)"
        @mouseleave="mouseleave"
      >
        <span>{{ node.label }}</span>
        <span
          class="custom-tree-button"
          v-if="iAct == data && changeMode === 'hover'"
        >
          <i @click.stop="() => nodeAdd(node, data)" class="el-icon-plus"></i>
          <!--增加分组-->
          <i
            @click.stop="() => nodeDelete(node, data)"
            class="el-icon-delete"
          ></i>
          <!--删除分组-->
          <i @click.stop="() => nodeEdit(node, data)" class="el-icon-edit"></i>
          <!--重命名分组-->
        </span>
        <div v-if="data.disabled" class="disabled" @click.stop></div>
      </div>
    </el-tree>
    <!-- 右键菜单栏 -->
    <div
      :style="{
        left: optionCardX + 'px',
        top: optionCardY + 'px'
      }"
      class="contextmenu"
      v-show="optionCardShow"
      id="option-button-group"
    >
      <el-button
        @click="nodeAdd(node, optionData)"
        class="option-card-button el-icon-plus"
      >
        新建</el-button
      >
      <el-button
        @click="nodeDelete(node, optionData)"
        class="option-card-button el-icon-delete"
      >
        删除</el-button
      >
      <el-button
        @click="nodeEdit(node, optionData)"
        class="option-card-button el-icon-edit"
      >
        编辑</el-button
      >
    </div>
  </div>
</template>

<script>
import { debounce } from '../utils/util'
export default {
  name: 'ws-tree',
  props: {
    // 是否有复选框
    showCheckBox: {
      type: Boolean,
      default: false
    },
    // 是否可拖拽
    draggable: {
      type: Boolean,
      default: false
    },
    // 增删改查模式
    changeMode: {
      default: '', // contextMenu / hover
      type: String
    },
    // 树的配置项
    treeProps: {
      default() {
        return {
          label: 'label',
          children: 'children'
          // firstSpellKey: 'nameFirstSpell' // 通过拼音首字母过滤，数据里面需要有这个字段
        }
      },
      type: Object
    },
    // 树数据
    treeData: {
      type: Array,
      default() {
        return []
      }
    },
    // 后续搜索 不被第一次的搜索操作影响
    excludeFirstSearch: {
      default: false,
      type: Boolean
    },
    // 拖拽控制
    allowDrop: {
      default() {
        return true
      },
      type: Function
    },
    allowDrag: {
      default() {
        return true
      },
      type: Function
    }
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
      alreadySet: false
    }
  },
  computed: {
    // 树节点名称字段
    labelKey() {
      return this.treeProps.label
    },
    // 首拼字段
    firstSpellKey() {
      return this.treeProps.firstSpellKey
    },
    content() {
      return this.changeMode === 'contextMenu'
        ? '鼠标右键可进行编辑'
        : this.changeMode === 'hover'
        ? '鼠标悬浮可进行编辑'
        : ''
    }
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
      this.$refs.tree.filter(val)
    }
  },
  methods: {
    // 右键菜单属性设置
    floderOption(e, data, n, t) {
      if (this.changeMode !== 'contextMenu') return
      this.optionCardShow = false
      this.optionCardX = e.x + 10
      this.optionCardY = e.y - 110
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
      this.customFormVisible = true
      const params = {
        fatherData: node.parent.data,
        currentData: data
      }
      this.$emit('nodeAdd', params)
    },
    // 修改
    nodeEdit(node, data) {
      this.customFormVisible = true
      const params = {
        fatherData: node.parent.data,
        currentData: data
      }
      this.$emit('nodeEdit', params)
    },
    // 节点删除
    nodeDelete(node, data) {
      this.$confirm('是否继续此操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (node.childNodes.length > 0) {
            this.$message.error('删除失败,该节点拥有子节点')
          } else {
            const params = data
            this.$emit('nodeDelete', params)
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '操作取消'
          })
        })
    },
    // 自由新增
    freeAdd() {
      this.$emit('freeAdd')
    },
    // 对复选操作进行防抖处理 -- 为了实现特殊过滤效果
    handleCheckChange: debounce(function (data, isChecked, isSubCheckeds) {
      // 防抖处理了，参数已经没有太大意义
      this.$emit('check-change', data, isChecked, isSubCheckeds)
    }, 300),
    handleNodeClick(data, node, el) {
      this.$emit('node-click', data, node, el)
    },
    // 允许拖拽
    handleDrop(draggingNode, dropNode, dropType, ev) {
      this.$emit('handleDrop', draggingNode, dropNode, dropType, ev)
    },
    // 获取所有节点key, 包括选中和半选中
    getAllCheckedKeys() {
      return this.$refs.tree
        .getCheckedKeys()
        .concat(this.$refs.tree.getHalfCheckedKeys())
    },
    getCheckedKeys() {
      return this.$refs.tree.getCheckedNodes().map((item) => item.id)
    },
    getCheckedNodes() {
      return this.$refs.tree.getCheckedNodes()
    },
    getCurrentNode(data) {
      return this.$refs.tree.getCurrentNode()
    },
    getCurrentKey() {
      return this.$refs.tree.getCurrentKey()
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
        return item === data.id
      })
      const condition = flag && index !== -1
      this.$refs.tree.setChecked(data.id, condition)

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
    }
  }
}
</script>

<style lang="less" scoped>
.contextmenu {
  width: 80px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  z-index: 99;
  position: fixed;
  .option-card-button {
    width: 100%;
    margin-left: 0 !important;
    font-size: 10px;
    border-radius: 0;
  }
}
.tree-content {
  height: 100%;
  padding: 5px 3px;
  background: #fafafa;
  .model-title {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tree {
    margin-top: 10px;
    overflow-y: auto;
    height: calc(100% - 54px);
    background: #fafafa;
  }
  .custom-tree-node {
    flex: 1;
    .custom-tree-button {
      position: absolute;
      right: 0;
      padding-right: 10px;
      z-index: 10;
      i {
        padding: 2px;
        color: #66b1ff;
      }
    }
  }
}
.disabled {
  cursor: not-allowed;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
}
/deep/ .el-tree-node__content {
  position: relative;
}
</style>
