<template>
  <el-select
    ref="wsSelect"
    :value="value"
    :filter-method="isTreeSelect ? filterMethodToTree : undefined"
    v-bind="{
      multiple,
      filterable: true,
      'popper-class': isTreeSelect ? 'ws-treeSelect' : 'ws-select',
      ...$attrs,
    }"
    v-on="$listeners"
  >
    <template v-if="isTreeSelect">
      <el-option value="treeOptionValue">
        <ws-tree
          ref="wsTree"
          v-bind="{
            showSearch: false,
            showOverflowTooltip: true,
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
        :key="item[valueKey]"
        :label="item[labelKey]"
        :value="item[valueKey]"
      >
        <slot v-bind="item"></slot>
      </el-option>
    </template>
    <template v-slot:empty>
      <slot name="empty"></slot>
    </template>
    <template v-slot:prefix>
      <slot name="prefix"></slot>
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
    props: {
      type: Object,
      default() {
        return {}
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
    return {}
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
    labelKey() {
      return this.props['label'] || 'label'
    },
    valueKey() {
      return this.props['value'] || 'value'
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
      return dataIsFlat
        ? data
        : treeToFlat(data, this.treeProps, this.treeNodeKey)
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
    // 全选操作
    selectAll(checked) {
      const selectValue = checked
        ? this.options.map((d) => d[this.valueKey])
        : []
      this.$emit('change', selectValue)
    },
    // 值变化，树回显
    playbackTree() {
      this.$nextTick(() => {
        const wsTree = this.$refs.wsTree
        if (!wsTree) return
        const valueIsArray = Array.isArray(this.value)
        if (this.multiple) {
          const value = valueIsArray ? this.value : []
          wsTree.setCheckedKeys(value)
        } else {
          !valueIsArray && wsTree.setCurrentKey(this.value)
        }
      })
    },
    // 转成树搜索
    filterMethodToTree(data) {
      this.$refs.wsTree.filterTextFn(data)
    },
    // 树节点点击事件。
    handleNodeClick(data, node, el) {
      if (this.multiple) return
      if (this.treeLeafOnly && !node.isLeaf) return
      const dataValue = data[this.treeNodeKey]
      this.$emit('change', dataValue)
      this.$refs.wsSelect.blur()
    },
    // 树节点选中事件
    handleCheck() {
      const checkedValues = this.$refs.wsTree.getCheckedKeys(this.treeLeafOnly)
      this.$emit('change', checkedValues)
    },
  },
}
</script>
<style lang="less">
.ws-select__checkbox {
  padding-left: 20px;
}
.ws-treeSelect {
  // max-width: 260px;
  .el-select-dropdown__item,
  .el-select-dropdown__item.selected,
  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    height: auto;
    padding: 0;
    margin: 0 6px;
  }
  .el-scrollbar__wrap {
    max-height: 350px !important;
  }
}
</style>
<style lang="less" scoped></style>
