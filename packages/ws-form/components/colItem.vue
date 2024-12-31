<template>
  <el-col
    :span="fieldItem.span"
    :style="{ paddingRight: `${(fieldItem.offestRight * 100) / 24}%` }"
    :class="{ 'form-group': fieldItem.children, collapsible: collapsible }"
  >
    <template v-if="fieldItem.children">
      <slot name="groupTitle">
        <div class="form-group-title" @click="changeCollapsed(fieldItem)">
          {{ fieldItem.label }}
        </div>
      </slot>
      <div
        class="form-group-content"
        v-show="!fieldItem.collapsed"
      >
        <colItem
          v-for="subFieldItem in fieldItem.children"
          :key="subFieldItem.prop + subFieldItem.label"
          :allOptions="allOptions"
          :fieldItem="subFieldItem"
          :formData="formData"
          :formStatus="formStatus"
          :fieldItemChange="fieldItemChange"
          :extraComponents="extraComponents"
          :changeCollapsed="changeCollapsed"
        >
          <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
            <slot :name="name" v-bind="scope"></slot>
          </template>
        </colItem>
      </div>
    </template>
    <!-- notLeftMargin: fieldItem.isSide && isSearchForm, -->
    <ws-form-item
      v-else
      v-bind="fieldItem"
      :required="undefined"
      :allOptions="allOptions"
      :fieldItem="fieldItem"
      :formData="formData"
      :formStatus="formStatus"
      :fieldItemChange="fieldItemChange"
      :extraComponents="extraComponents"
    >
      <!-- 将父组件插槽内容转发给子组件 -->
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="scope">
        <slot :name="name" v-bind="scope"></slot>
      </template>
    </ws-form-item>
  </el-col>
</template>

<script>
import wsFormItem from '../../ws-form-item/index.vue'
export default {
  name: 'colItem',
  components: {
    wsFormItem,
  },
  props: {
    fieldItem: {
      type: Object,
      default: () => ({}),
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
    fieldItemChange: {
      type: Function,
      default: () => {},
    },
    // 下拉框选项配置数组
    allOptions: {
      type: Object,
      default: () => ({}),
    },
    // 表单模式 -- detail：详情模式, review：审阅模式  edit:新增或编辑模式
    // detail时，表单元素不可编辑，没有操作按钮；review时，表单元素不可编辑，有操作按钮；edit时，表单元素可编辑，有操作按钮
    formStatus: {
      default: 'edit',
      type: String,
    },
    // 额外的引入的组件
    extraComponents: {
      default() {
        return {}
      },
      type: Object,
    },
    // 分组折叠项变更处理函数
    changeCollapsed: {
      type: Function,
      default: () => {},
    },
    // 是否可以折叠
    collapsible: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {}
  },
  created() {},
  methods: {},
}
</script>

<style lang="less" scoped>
.form-group {
  padding: 0 !important;
  .form-group-title {
    font-weight: bold;
    border-bottom: 1px solid #dadada;
    padding: 4px 0;
    margin-bottom: 6px;
  }
  .form-group-content {
  }
}
</style>
