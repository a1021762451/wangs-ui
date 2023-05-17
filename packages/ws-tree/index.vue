<template>
  <div class="tree-content">
    <!-- 添加根节点按钮 -->
    <div class="model-title" v-if="changeMode">
      <span class="model-title-left">
        <slot name="titleLeft">
          <span>类型</span>
          <el-tooltip effect="dark" placement="top" :content="content">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </slot>
      </span>
      <span class="model-title-right">
        <slot name="titleRight">
          <el-tooltip effect="dark" placement="right" content="添加根节点">
            <i
              class="el-icon-plus"
              style="cursor: pointer"
              @click="freeAdd"
            ></i>
          </el-tooltip>
        </slot>
      </span>
    </div>
    <!-- 搜索框 -->
    <el-input
      placeholder="按关键字筛选"
      v-model="filterText"
      size="small"
    ></el-input>
    <!-- 树主体 -->
    <div class="tree-container">
      <el-tree
        ref="tree"
        class="tree-ele"
        node-key="id"
        default-expand-all
        highlight-current
        :filter-node-method="
          excludeFirstSearch ? excludeFirstSearchFilterNode : filterNode
        "
        :expand-on-click-node="false"
        @node-contextmenu="floderOption"
        v-bind="$attrs"
        v-on="$listeners"
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
            <i
              v-for="item in operationsList"
              :key="item.value"
              @click.stop="happenEvent(node, data, item)"
              :class="`${item.class}`"
            ></i>
          </span>
          <div v-if="data.disabled" class="disabled" @click.stop></div>
        </div>
      </el-tree>
    </div>
    <!-- 右键菜单栏 -->
    <div
      :style="{
        left: optionCardX + 'px',
        top: optionCardY + 'px',
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
export default {
  name: 'ws-tree',
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
    content() {
      return this.changeMode === 'contextMenu'
        ? '鼠标右键可进行编辑'
        : this.changeMode === 'hover'
        ? '鼠标悬浮可进行编辑'
        : ''
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
      this.$refs.tree.filter(val)
    },
  },
  methods: {
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
        currentData: data,
      }
      this.$emit('nodeAdd', params)
    },
    // 修改
    nodeEdit(node, data) {
      this.customFormVisible = true
      const params = {
        fatherData: node.parent.data,
        currentData: data,
      }
      this.$emit('nodeEdit', params)
    },
    // 节点删除
    nodeDelete(node, data) {
      this.$confirm('是否继续此操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
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
            message: '操作取消',
          })
        })
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
    getCheckedKeys() {
      return this.$refs.tree.getCheckedKeys(...arguments)
    },
    getCheckedNodes() {
      return this.$refs.tree.getCheckedNodes(...arguments)
    },
    getCurrentNode() {
      return this.$refs.tree.getCurrentNode(...arguments)
    },
    getCurrentKey() {
      return this.$refs.tree.getCurrentKey(...arguments)
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
    },
  },
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
  // background: #fafafa;
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
    // display: flex;
    // align-items: center;
    // justify-content: space-between;
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
  .tree-container {
    // height: 100%;
    overflow: auto;
    border: none;
    padding: 10px 0;
    // margin-top: 10px;
    // overflow-y: auto;
    // height: calc(100% - 54px);
    // background: #fafafa;
    flex: 1;
    /deep/ .el-tree {
      display: inline-block;
      min-width: 100%;
    }
  }
  .tree-ele {
    height: 100%; /*这里要比上面小一点，不然节点就几行就出现纵向滚动条*/
    /* overflow: auto;这个貌似要去掉，不然会出现双滚动条*/
    border: none;
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
