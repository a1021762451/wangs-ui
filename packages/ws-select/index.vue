<template>
  <el-select
    ref="wsSelect"
    :value="value"
    :filter-method="isTreeSelect ? filterMethodToTree : undefined"
    @blur="handleBlur"
    v-bind="{
      filterable: true,
      'popper-class': isTreeSelect ? 'ws-treeSelect ws-select' : 'ws-select',
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
            currentNodeKey: typeof value === 'string' ? value : undefined,
            ...treeConfig,
            'check-on-click-node': true,
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
        :value="item[valueKey]"
      />
    </template>
    <template v-else>
      <el-checkbox
        v-if="isNeedSelectAll && multiple && options.length > 0"
        :value="isCheckAll"
        :indeterminate="indeterminate"
        @change="selectAll"
        class="ws-select__checkbox"
      >
        全选
      </el-checkbox>
      <template v-for="item in options">
        <el-option-group v-if="item.children" :key="item.label" v-bind="item">
          <el-option
            v-for="nextItem in item.children"
            :key="nextItem.label + nextItem.value"
            v-bind="nextItem"
          >
            <!-- 内容 -->
            <wsTooltip
              popper-class="el-tooltip_custom"
              :content="nextItem.label"
              overflow
              :placement="'right'"
            >
              <div class="ws-select__label">
                <slot name="label" v-bind="nextItem">
                  {{ nextItem.label }}
                </slot>
              </div>
            </wsTooltip>
          </el-option>
        </el-option-group>
        <el-option v-else :key="item.label + item.value" v-bind="item">
          <!-- 内容 -->
          <wsTooltip
            popper-class="el-tooltip_custom"
            :content="item.label"
            overflow
            :placement="'right'"
          >
            <div class="ws-select__label">
              <slot name="label" v-bind="item">
                {{ item.label }}
              </slot>
            </div>
          </wsTooltip>
        </el-option>
      </template>
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
let treeNodeKeyMap = {}
let valueKeyMap = {}
let lastCheckedKeys = []
import { treeToFlat, getObjAttr } from '../utils/util'
import wsTree from '../ws-tree/index.vue'
import wsTooltip from '../ws-tooltip/index.vue'
export default {
  name: 'ws-select',
  components: {
    wsTree,
    wsTooltip,
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
    // 是否是下拉树
    isTreeSelect: {
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
  },
  data() {
    return {}
  },
  computed: {
    multiple() {
      // 布尔值简写获取到的是空字符串
      return this.$attrs.multiple === '' || !!this.$attrs.multiple
    },
    flatOptions() {
      return treeToFlat(this.options)
    },
    isCheckAll() {
      return this.value.length === this.flatOptions.length
    },
    indeterminate() {
      return (
        this.value.length > 0 && this.value.length < this.flatOptions.length
      )
    },
    treeProps() {
      return this.treeConfig.props || {}
    },
    treeNodeKey() {
      return getObjAttr(this.treeConfig, 'nodeKey') || 'id'
    },
    valueKey() {
      return this.treeProps.id || this.treeNodeKey
    },
    treeLabelKey() {
      return this.treeProps['label'] || 'label'
    },
    flatTreeData() {
      const { data, dataIsFlat } = this.treeConfig
      return dataIsFlat
        ? data
        : treeToFlat(data, {
            id: this.treeNodeKey,
            ...this.treeProps,
          }, false)
    },
    keyIsOnly() {
      return this.valueKey === this.treeNodeKey
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
    flatTreeData: {
      handler() {
        if (this.isTreeSelect) {
          this.getDataMap()
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 下拉框失焦事件-对树单独处理
    handleBlur() {
      if (this.isTreeSelect) {
        this.filterMethodToTree('')
      }
    },
    // 全选操作
    selectAll(checked) {
      const selectValue = checked ? this.flatOptions.map((d) => d.value) : []
      this.$emit('change', selectValue)
    },
    // 值变化，树回显
    playbackTree() {
      this.$nextTick(() => {
        const wsTree = this.$refs.wsTree
        if (!wsTree) return
        const valueIsArray = Array.isArray(this.value)
        if (!this.keyIsOnly) {
          this.playbackTreeNotOnly(valueIsArray, wsTree)
          return
        }
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
      const dataValue = data[this.valueKey]
      this.$emit('change', dataValue)
      this.$refs.wsSelect.blur()
    },
    // 树节点选中事件
    handleCheck() {
      if (!this.multiple) return
      const currentCheckedKeys = this.$refs.wsTree.getCheckedKeys(
        this.treeLeafOnly
      )
      if (!this.keyIsOnly) {
        this.handleCheckNotOnly(currentCheckedKeys)
        return
      }
      this.$emit('change', currentCheckedKeys)
    },
    // 兼容nodeKey和valueKey不同的情况
    handleCheckNotOnly(currentCheckedKeys) {
      const removeArr = lastCheckedKeys.filter(
        (item) => !currentCheckedKeys.includes(item)
      )
      const removeValueKeys = this.getReleatedValueKeys(removeArr)
      const currentValuesKeys =
        this.getReleatedValueKeys(currentCheckedKeys)
      const valueKeys = currentValuesKeys.filter((key) => {
        return !removeValueKeys.includes(key)
      })
      this.$emit('change', valueKeys)
    },
    // 兼容nodeKey和valueKey不同的情况
    playbackTreeNotOnly(valueIsArray, wsTree) {
      if (this.multiple) {
        const value = valueIsArray ? this.value : []
        let checkedKeys = []
        value.forEach((item) => {
          if (valueKeyMap[item]) {
            const itemCheckedKeys = valueKeyMap[item].map(
              (item) => item[this.treeNodeKey]
            )
            checkedKeys = checkedKeys.concat(itemCheckedKeys)
          }
        })
        lastCheckedKeys = checkedKeys
        wsTree.setCheckedKeys(checkedKeys)
      } else {
        const nodeArr = valueKeyMap[this.value]
        !valueIsArray &&
          nodeArr &&
          wsTree.setCurrentKey(nodeArr[0][this.treeNodeKey])
      }
    },
    getReleatedValueKeys(keys) {
      let keysNodes = []
      keys.forEach((key) => {
        keysNodes = keysNodes.concat(treeNodeKeyMap[key] || [])
      })
      const valueKeys = Array.from(
        new Set(keysNodes.map((item) => item[this.valueKey]))
      )
      return valueKeys
    },
    // 获取数据map
    getDataMap() {
      treeNodeKeyMap = {}
      valueKeyMap = {}
      this.flatTreeData.forEach((item) => {
        if (treeNodeKeyMap[item[this.treeNodeKey]]) {
          treeNodeKeyMap[item[this.treeNodeKey]].push(item)
        } else {
          treeNodeKeyMap[item[this.treeNodeKey]] = [item]
        }
        if (valueKeyMap[item[this.valueKey]]) {
          valueKeyMap[item[this.valueKey]].push(item)
        } else {
          valueKeyMap[item[this.valueKey]] = [item]
        }
      })
    },
  },
}
</script>
<style lang="less">
.ws-select {
  max-width: 350px;
}
.ws-select__checkbox {
  padding-left: 20px;
}
.ws-treeSelect,
.ws-treeSelect.is-multiple {
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
.el-tooltip_custom {
  max-width: 500px;
}
</style>
<style lang="less" scoped>
.ws-select__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/deep/ .tree-content {
  .container-showOverflowTooltip {
    overflow: visible;
  }
}
</style>
