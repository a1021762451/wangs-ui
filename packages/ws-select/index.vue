<template>
  <el-select
    ref="wsSelect"
    :value="value"
    @blur="handleBlur"
    @focus="handleFocus"
    v-bind="{
      filterable: true,
      'popper-class': isTreeSelect ? 'ws-treeSelect ws-select' : 'ws-select',
      ...$attrs,
      'filter-method': filterMethod,
      'remote-method': remoteMethod,
      loading: loadingData,
    }"
    v-on="$listeners"
  >
    <el-checkbox
      v-if="isNeedSelectAll && multiple && optionsCpt.length > 0"
      :value="isCheckAll"
      :indeterminate="indeterminate"
      @change="selectAll"
      class="ws-select__checkbox"
    >
      全选
    </el-checkbox>
    <template v-if="isTreeSelect">
      <el-option value="treeOptionValue">
        <ws-tree
          ref="wsTree"
          :class="{ 'ws-tree-isOneLevel': treeDataIsOneLevel }"
          v-bind="{
            showSearch: false,
            showOverflowTooltip: true,
            'default-expand-all': true,
            currentNodeKey: typeof value === 'string' ? value : undefined,
            ...treeConfig,
            data: treeConfig.data || optionsCpt,
            props: treeProps,
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
        v-for="item in flatOptions"
        :key="item[treeNodeKey]"
        :label="item[labelKey]"
        :value="item[valueKey]"
      />
    </template>
    <template v-else>
      <template v-for="item in optionsFilterData">
        <el-option-group
          v-if="item.children"
          :key="item[labelKey]"
          v-bind="item"
        >
          <el-option
            v-for="nextItem in item.children"
            :key="nextItem[labelKey] + nextItem[valueKey]"
            v-bind="nextItem"
          >
            <!-- 内容 -->
            <wsTooltip
              popper-class="el-tooltip_custom"
              :content="nextItem[labelKey]"
              overflow
              :placement="'right'"
            >
              <div class="ws-select__label">
                <slot name="label" v-bind="nextItem">
                  {{ nextItem[labelKey] }}
                </slot>
              </div>
            </wsTooltip>
          </el-option>
        </el-option-group>
        <el-option v-else :key="item[labelKey] + item[valueKey]" v-bind="item">
          <!-- 内容 -->
          <el-checkbox
            @change="handleCheckChange(item)"
            v-if="multiple && isNeedCheckbox"
            :value="value.includes(item[valueKey])"
          >
            <wsTooltip
              popper-class="el-tooltip_custom"
              :content="item[labelKey]"
              overflow
              :placement="'right'"
            >
              <div class="ws-select__label">
                <slot name="label" v-bind="item">
                  {{ item[labelKey] }}
                </slot>
              </div>
            </wsTooltip>
          </el-checkbox>
          <wsTooltip
            popper-class="el-tooltip_custom"
            :content="item[labelKey]"
            overflow
            :placement="'right'"
            v-else
          >
            <div class="ws-select__label">
              <slot name="label" v-bind="item">
                {{ item[labelKey] }}
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
let wsSelectRequestConfig = {
  //  后台请求，promise, resole值为{rows: 表格数据, columns: 列设置,total: 总数-非必填}
  requestFn: null,
  // 没有requestFn,需传入以下参数
  request: null, // axios等封装，没有window.request
  url: '', // 请求地址
  method: 'get', // 请求方法
  params: {}, // 请求参数
  dataLevel: 2, // 请求返回数据层级
  // 请求字段映射
  fields: {
    label: 'label',
    value: 'value',
  },
  requestAfterFocus: false, // 是否在聚焦时请求
}
let treeNodeKeyMap = {}
let valueKeyMap = {}
let lastCheckedKeys = []
import {
  treeToFlat,
  getObjAttr,
  dispatch,
  deepMerge,
  deepClone,
} from '../utils/util'
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
    // 请求配置，会与defaultRequestConfig合并
    requestConfig: {
      default() {
        return {}
      },
    },
    // 绑定值
    value: {
      default: '',
      type: String | Number | Array,
    },
    // 下拉选项
    options: {
      type: Array,
    },
    // 非树 多选模式是否需要全选
    isNeedSelectAll: {
      type: Boolean,
      default: false,
    },
    // 非树 多选模式节点是否需要显示复选框
    isNeedCheckbox: {
      type: Boolean,
      default: false,
    },
    // 是否是下拉树
    isTreeSelect: {
      type: Boolean,
      default: false,
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
    // props配置
    props: {
      type: Object,
      default() {
        return {}
      },
    },
    // 使用请求
    useRequest: {
      type: Boolean,
      default: false,
    },
    // 为true remoteMethod 不调用接口
    fakeRemote: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      optionsData: null,
      optionsFilterData: [],
      hasRequested: false,
      loadingData: this.loading,
      query: '',
    }
  },
  computed: {
    optionsCpt() {
      return this.optionsData || this.options
    },
    // 优先treeConfig的props，其次props
    treeProps() {
      return this.treeConfig.props || this.props
    },
    treeNodeKey() {
      return getObjAttr(this.treeConfig, 'nodeKey') || 'id'
    },
    remote() {
      return this.$attrs.remote
    },
    filterMethod() {
      if (this.remote) return undefined
      return getObjAttr(this.$attrs, 'filterMethod') || this.filterMethodCustom
    },
    remoteMethod() {
      if (!this.remote) return undefined
      return getObjAttr(this.$attrs, 'remoteMethod') || this.remoteMethodCustom
    },
    multiple() {
      // 布尔值简写获取到的是空字符串
      return this.$attrs.multiple === '' || !!this.$attrs.multiple
    },
    flatOptions() {
      const { dataIsFlat } = this.treeConfig
      return dataIsFlat
        ? this.optionsCpt
        : treeToFlat(this.optionsCpt, {
            id: this.treeNodeKey,
            ...this.treeProps,
          })
    },
    checkableOptions() {
      if (!this.isTreeSelect) return this.flatOptions.filter((d) => !d.disabled)
      else {
        const childrenKey = this.treeProps.children || 'children'
        return this.flatOptions.filter(
          (d) =>
            !d.disabled &&
            (!this.treeLeafOnly || !d[childrenKey] || !d[childrenKey].length)
        )
      }
    },
    isCheckAll() {
      return this.value.length === this.checkableOptions.length
    },
    indeterminate() {
      return (
        this.value.length > 0 &&
        this.value.length < this.checkableOptions.length
      )
    },
    valueKey() {
      if (!this.isTreeSelect) return this.props['value'] || 'value'
      else return this.treeProps['id'] || this.treeNodeKey
    },
    labelKey() {
      if (!this.isTreeSelect) return this.props['label'] || 'label'
      else return this.treeProps['label'] || 'label'
    },
    treeKeyIsOnly() {
      return this.valueKey === this.treeNodeKey
    },
    // 树数据只有一级
    treeDataIsOneLevel() {
      const childrenKey = this.treeProps.children || 'children'
      return this.flatOptions.every(
        (d) => !d[childrenKey] || !d[childrenKey].length
      )
    },
    requestConfigCpt() {
      // 针对项目的全局配置
      const defaultConfig = deepMerge(
        deepClone(wsSelectRequestConfig),
        window.wsSelectRequestConfig || {}
      )
      const obj = deepMerge(defaultConfig, this.requestConfig)
      obj.request = obj.request || window.request
      return obj
    },
    requestFn() {
      if (!this.useRequest) return null
      return this.createRequestFn() || this.requestConfigCpt.requestFn
    },
    requestAfterFocus() {
      return this.requestConfigCpt.requestAfterFocus
    },
  },
  watch: {
    // 树回显
    value: {
      handler() {
        if (this.isTreeSelect) {
          this.playbackTree()
        }
      },
      immediate: true,
    },
    // 获取映射数据
    flatOptions: {
      handler() {
        if (this.isTreeSelect) {
          this.getDataMap()
        }
      },
      immediate: true,
    },
    // 初始化下拉框数据
    optionsCpt: {
      handler() {
        this.optionsFilterData = this.flatOptions
      },
      immediate: true,
    },
    loading: {
      handler(newData) {
        this.loadingData = newData
      },
      immediate: true,
    },
  },
  created() {
    !this.requestAfterFocus && this.getDataByFn()
  },
  methods: {
    dispatch,
    // 下拉框失焦事件-对树单独处理
    handleBlur() {
      if (this.isTreeSelect) {
        this.filterMethodToTree('')
      }
    },
    // 聚焦事件
    handleFocus() {
      if (this.requestAfterFocus && !this.hasRequested) {
        this.getDataByFn()
        this.hasRequested = true
      }
    },
    // 全选操作
    selectAll(checked) {
      let selectValue = checked
        ? this.checkableOptions.map((d) => d[this.valueKey])
        : []
      // 去重
      selectValue = Array.from(new Set(selectValue))
      this.emitChange(selectValue)
    },
    // 值变化，树回显
    playbackTree() {
      this.$nextTick(() => {
        const wsTree = this.$refs.wsTree
        if (!wsTree) return
        const valueIsArray = Array.isArray(this.value)
        if (!this.treeKeyIsOnly) {
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
    filterMethodToTree(query) {
      this.$refs.wsTree.filterTextFn(query)
    },
    // 转成下拉搜索
    filterMethodToSelect(query) {
      const { pinyin = 'pinyin', pinyinInitial = 'pinyinInitial' } = this.props
      if (!query) this.optionsFilterData = this.flatOptions
      this.optionsFilterData = this.flatOptions.filter((data) => {
        // console.log(item.name, 'item.name')
        const someArr = [data[this.labelKey]]
        if (data[pinyin]) someArr.push(data[pinyin])
        if (data[pinyinInitial]) someArr.push(data[pinyinInitial])
        return someArr.some((keyword) => {
          keyword = keyword || ''
          return keyword.toLowerCase().indexOf(query.toLowerCase()) > -1
        })
      })
    },
    filterMethodCustom(query) {
      if (this.isTreeSelect) {
        this.filterMethodToTree(query)
      } else {
        this.filterMethodToSelect(query)
      }
    },
    remoteMethodCustom(query) {
      if (this.fakeRemote) {
        this.filterMethodCustom(query)
      } else {
        this.query = query
        this.getDataByFn()
      }
    },
    // 树节点点击事件。
    handleNodeClick(data, node, el) {
      if (this.multiple) return
      if (this.treeLeafOnly && !node.isLeaf) return
      const dataValue = data[this.valueKey]
      this.emitChange(dataValue)
      this.$refs.wsSelect.blur()
    },
    // 树节点选中事件
    handleCheck() {
      if (!this.multiple) return
      const currentCheckedKeys = this.$refs.wsTree.getCheckedKeys(
        this.treeLeafOnly
      )
      if (!this.treeKeyIsOnly) {
        this.handleCheckNotOnly(currentCheckedKeys)
        return
      }
      this.emitChange(currentCheckedKeys)
    },
    // 兼容nodeKey和valueKey不同的情况
    handleCheckNotOnly(currentCheckedKeys) {
      const removeArr = lastCheckedKeys.filter(
        (item) => !currentCheckedKeys.includes(item)
      )
      const removeValueKeys = this.getReleatedValueKeys(removeArr)
      const currentValuesKeys = this.getReleatedValueKeys(currentCheckedKeys)
      const valueKeys = currentValuesKeys.filter((key) => {
        return !removeValueKeys.includes(key)
      })
      this.emitChange(valueKeys)
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
      this.flatOptions.forEach((item) => {
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
    // 选项有复选框时
    handleCheckChange(item) {
      // const arr = [...this.value]
      const arr = this.value
      const checkValue = arr.includes(item[this.valueKey])
      console.log(checkValue, item, 'checkValue, item')
      if (checkValue) {
        arr.splice(arr.indexOf(item[this.valueKey]), 1)
      } else {
        arr.push(item[this.valueKey])
      }
      this.emitChange(arr)
    },
    emitChange(value) {
      this.$emit('change', value)
      this.dispatch('ElFormItem', 'el.form.change', [value])
    },
    // 创建请求函数
    createRequestFn() {
      const { request, requestCb, params, method, url, fields } =
        this.requestConfigCpt
      let { dataLevel } = this.requestConfigCpt
      const { label, value, query = 'query' } = fields
      if (!url || !request) return
      const obj = {
        ...params,
      }
      obj[query] = this.query
      return () => {
        return new Promise((resolve, reject) => {
          request({
            url,
            method,
            params: obj,
            data: obj,
          }).then((res) => {
            while (dataLevel > 0) {
              res = res.data
              dataLevel--
            }
            res = res || []
            res = res.map((item) => {
              return {
                ...item,
                label: item[label],
                value: item[value],
              }
            })
            if (typeof requestCb === 'function') {
              res = requestCb(res)
            }
            resolve(res)
          })
        })
      }
    },
    // 通过配置的接口获取数据
    async getDataByFn() {
      if (!this.requestFn) return
      this.loadingData = true
      const data = await this.requestFn(this.query)
      this.loadingData = false
      this.optionsData = data
    },
  },
}
</script>
<style lang="less">
.ws-select {
  max-width: 350px;
}
.ws-select__checkbox {
  padding: 3px 0 3px 20px;
  border-bottom: 1px solid #ebeef5;
  width: 100%;
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
/deep/ .ws-tree-isOneLevel {
  padding-top: 0;
  .el-tree-node {
    padding: 0 0 0 10px;
    .el-tree-node__content {
      height: auto;
      .el-tree-node__expand-icon {
        display: none;
      }
    }
  }
}
</style>
