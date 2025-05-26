<template>
  <el-select
    ref="wsSelect"
    :value="value"
    @blur="handleBlur"
    @focus="handleFocus"
    @visible-change="handleVisibleChange"
    v-bind="{
      placeholder: '请选择',
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
            data: optionsCpt,
            props: propsCpt,
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
          v-if="item[childrenKey]"
          :key="item[labelKey]"
          v-bind="item"
        >
          <el-option
            v-for="nextItem in item[childrenKey]"
            :key="nextItem[labelKey] + nextItem[valueKey]"
            v-bind="nextItem"
          >
            <!-- 内容 -->
            <wsTooltip
              popper-class="el-tooltip_custom"
              :content="nextItem[showLabelKey]"
              overflow
              :placement="'right'"
            >
              <div class="ws-select__label">
                <slot name="label" v-bind="nextItem">
                  {{ nextItem[showLabelKey] }}
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
              :content="item[showLabelKey]"
              overflow
              :placement="'right'"
            >
              <div class="ws-select__label">
                <slot name="label" v-bind="item">
                  {{ item[showLabelKey] }}
                </slot>
              </div>
            </wsTooltip>
          </el-checkbox>
          <wsTooltip
            popper-class="el-tooltip_custom"
            :content="item[showLabelKey]"
            overflow
            :placement="'right'"
            v-else
          >
            <div class="ws-select__label">
              <slot name="label" v-bind="item">
                {{ item[showLabelKey] }}
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
let pinyinPackage = null
import {
  treeToFlat,
  getObjAttr,
  dispatch,
  deepMerge,
  deepClone,
  def,
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
    // 开启前端拼音搜索功能
    needPinyin: {
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
      return (
        this.optionsData ||
        this.options ||
        (this.isTreeSelect && this.treeConfig.data ? this.treeConfig.data : [])
      )
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
    // 是否多选
    multiple() {
      // 布尔值简写获取到的是空字符串
      return this.$attrs.multiple === '' || !!this.$attrs.multiple
    },
    // 扁平化数据
    flatOptions() {
      if (this.isTreeSelect) {
        const { dataIsFlat } = this.treeConfig
        return dataIsFlat
          ? this.optionsCpt
          : treeToFlat(this.optionsCpt, this.propsCpt)
      } else {
        return treeToFlat(this.optionsCpt, this.propsCpt)
      }
    },
    checkableOptions() {
      return this.flatOptions.filter(
        (d) =>
          !d.disabled &&
          (!this.treeLeafOnly ||
            !d[this.childrenKey] ||
            !d[this.childrenKey].length)
      )
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
    //  树组件合并props取值 优先treeConfig的props，其次props
    propsCpt() {
      return this.isTreeSelect
        ? {
            ...this.props,
            id: this.treeNodeKey,
            ...(this.treeConfig.props || {}),
          }
        : this.props
    },
    valueKey() {
      if (!this.isTreeSelect) return this.propsCpt['value'] || 'value'
      else return this.propsCpt['id']
    },
    labelKey() {
      return this.propsCpt['label'] || 'label'
    },
    // 节点展示名称
    showLabelKey() {
      return this.propsCpt['showLabel'] || this.labelKey
    },
    // 节点展示名称
    childrenKey() {
      return this.propsCpt['children'] || 'children'
    },
    treeKeyIsOnly() {
      return this.valueKey === this.treeNodeKey
    },
    // 树数据只有一级
    treeDataIsOneLevel() {
      return this.flatOptions.every(
        (d) => !d[this.childrenKey] || !d[this.childrenKey].length
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
    // 初始化下拉框数据
    flatOptions: {
      handler() {
        if (!this.isTreeSelect) this.optionsFilterData = this.flatOptions
        if (this.needPinyin) this.handlePinyin(this.flatOptions)
        if (this.isTreeSelect) {
          this.getDataMap()
        }
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
    this.importPackage()
  },
  methods: {
    dispatch,
    // handleChange
    handleVisibleChange(status) {
      // 非树
      if (!this.isTreeSelect) {
        this.query = ''
        // 单选 面板关闭后重置下拉选项
        if (!this.multiple && !status) this.optionsFilterData = this.flatOptions
      }
    },
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
      const { pinyin = 'pinyin', pinyinInitial = 'pinyinInitial' } =
        this.propsCpt
      if (!query) this.optionsFilterData = this.flatOptions
      this.optionsFilterData = this.flatOptions.filter((data) => {
        // console.log(item.name, 'item.name')
        const someArr = [data[this.showLabelKey]]
        if (data[pinyin]) someArr.push(data[pinyin])
        if (data[pinyinInitial]) someArr.push(data[pinyinInitial])
        return someArr.some((keyword) => {
          keyword = keyword || ''
          return keyword.toLowerCase().indexOf(query.toLowerCase()) > -1
        })
      })
    },
    filterMethodCustom(query) {
      this.query = query
      if (this.isTreeSelect) {
        this.filterMethodToTree(query)
      } else {
        this.filterMethodToSelect(query)
      }
    },
    remoteMethodCustom(query) {
      this.query = query
      if (this.fakeRemote) {
        this.filterMethodCustom(query)
      } else {
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
    handlePinyin(data) {
      if (!pinyinPackage) this.importPackage()
      const { pinyin = 'pinyin', pinyinInitial = 'pinyinInitial' } =
        this.propsCpt
      data.forEach((item) => {
        def(
          item,
          pinyin,
          pinyinPackage(item[this.showLabelKey], {
            style: pinyinPackage.STYLE_NORMAL,
          }).join('')
        )
        def(
          item,
          pinyinInitial,
          pinyinPackage(item[this.showLabelKey], {
            style: pinyinPackage.STYLE_FIRST_LETTER,
          }).join('')
        )
      })
      return data
    },
    // 导入包
    importPackage() {
      // 判断是否有拖拽,有就引入Sortable
      // 判断是否工具箱是否有下载,有就引入table-excel
      try {
        if (this.needPinyin && !pinyinPackage) {
          pinyinPackage = require('pinyin')
        }
      } catch (error) {
        console.error('请安装对应的依赖包')
      }
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
  padding-right: 10px;
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
