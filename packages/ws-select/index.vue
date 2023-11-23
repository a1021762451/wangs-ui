<template>
  <el-select
    ref="wsSelect"
    :value="value"
    v-bind="{
      multiple,
      filterable: true,
      'popper-class': isTreeSelect ? 'ws-treeSelect' : 'ws-select',
      ...$attrs,
    }"
    v-on="$listeners"
    @clear="clear"
    :filter-method="filterMethod"
  >
    <template v-if="isTreeSelect">
      <el-option value="treeOptionValue">
        <ws-tree
          ref="wsTree"
          v-bind="{
            showSearch: false,
            textEllipsis: true,
            'default-expand-all': true,
            ...treeConfig,
            showCheckbox: multiple,
          }"
          @node-click="handleNodeClick"
          @check="handleCheck"
          v-on="$listeners"
        >
          <!-- 将父组件插槽内容转发给子组件 -->
          <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
            <slot :name="name" v-bind="scope"></slot>
          </template>
        </ws-tree>
      </el-option>
      <el-option
        style="display: none"
        v-for="item in flatTreeData"
        :key="item[treeNodeKey]"
        :label="item[treeLabelKey]"
        :value="item[treeNodeKey]"
      />
    </template>
    <template v-else>
      <el-checkbox
        :value="isCheckAll"
        :indeterminate="indeterminate"
        @change="selectAll"
        v-if="isNeedSelectAll && multiple && options.length > 0"
        class="ws-select__checkbox"
      >
        全选
      </el-checkbox>
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </template>
  </el-select>
</template>
<script>
import { treeToFlat } from '../utils/util'
import wsTree from '../ws-tree/index.vue'
export default {
  name: 'ws-select',
  components: {
    wsTree,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    // 绑定值
    value: {
      default: '',
      type: String | Number | Array,
    },
    // 下拉选项
    options: {
      type: Array,
      default() {
        return []
      },
    },
    // 多选模式是否需要全选
    isNeedSelectAll: {
      type: Boolean,
      default: false,
    },
    // 下拉框模式  treeSelect | ''
    selectMode: {
      type: String | Array,
      default: '',
    },
    // 树配置
    treeConfig: {
      type: Object,
      default() {
        return {}
      },
    },
    // 单选或者多选时，是否只能选择叶子节点
    treeLeafOnly: {
      type: Boolean,
      default: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      checkboxLeftPadding: 0, // checkbox的左边距,
    }
  },
  computed: {
    isCheckAll() {
      return this.value.length === this.options.length
    },
    indeterminate() {
      return this.value.length > 0 && this.value.length < this.options.length
    },
    isTreeSelect() {
      return this.selectMode.includes('treeSelect')
    },
    treeNodeKey() {
      const treeConfig = this.treeConfig
      return treeConfig['node-key'] || treeConfig['nodeKey'] || 'id'
    },
    treeProps() {
      const treeConfig = this.treeConfig
      return treeConfig.props || {}
    },
    treeLabelKey() {
      return this.treeProps['label'] || 'label'
    },
    flatTreeData() {
      const { data, dataIsFlat } = this.treeConfig
      if (dataIsFlat) {
        return data
      } else {
        return treeToFlat(data, this.treeProps, this.treeNodeKey)
      }
    },
  },
  watch: {
    value: {
      handler() {
        if (this.isTreeSelect) {
          this.playbackTree()
        }
      },
      immediate: true,
    },
  },
  methods: {
    playbackTree() {
      console.log('playbackTree', this.value)
      this.$nextTick(() => {
        if (this.multiple) {
          const value = Array.isArray(this.value) ? this.value : []
          this.$refs.wsTree.setCheckedKeys(value)
        } else {
          !Array.isArray(this.value) &&
            this.$refs.wsTree.setCurrentKey(this.value)
        }
      })
    },
    selectAll(checked) {
      const selectValue = checked ? this.options.map((d) => d.value) : []
      this.$emit('change', selectValue)
    },
    clear() {
      this.$emit('change', '')
    },
    filterMethod(data) {
      if (data !== undefined) {
        this.$refs.wsTree.filterTextFn(data)
      }
    },
    handleNodeClick(data, node, el) {
      if (this.multiple) return
      if (this.treeLeafOnly && !node.isLeaf) return
      console.log('handleNodeClick', data, node, el)
      const dataValue = data[this.treeNodeKey]
      this.$emit('change', dataValue)
      this.$refs.wsSelect.blur()
    },
    handleCheck(
      data,
      { checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKey }
    ) {
      const checkedValues = this.$refs.wsTree.getCheckedKeys(this.treeLeafOnly)
      this.$emit('change', checkedValues)
      console.log('handleCheck', data, checkedNodes, checkedKeys)
    },
  },
}
</script>
<style lang="less">
.ws-select__checkbox {
  padding-left: 20px;
}
.ws-treeSelect {
  max-width: 260px;
  .el-select-dropdown__item,
  .el-select-dropdown__item.selected,
  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    height: auto;
    padding: 0;
    margin: 0 6px;
  }
  .custom-tree-node {
    position: relative;
  }
  .el-scrollbar__wrap {
    max-height: 350px !important;
  }
  // .el-tree {
  //   max-height: 300px;
  //   overflow-y: auto;
  // }
}
</style>
<style lang="less" scoped>
// .ws-select {
//   height: auto;
//   max-height: 200px;
//   overflow-y: auto;
//   padding: 0;
// }
</style>
