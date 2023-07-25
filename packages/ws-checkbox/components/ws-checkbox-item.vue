<template>
  <div style="margin-bottom: 10px">
    <div :span="24" v-if="name" class="inner-text">
      <span class="title">
        {{ name }}
      </span>
      <el-checkbox
        v-if="allowCheckAll"
        :indeterminate="isIndeterminate"
        v-model="isCheckAll"
        @change="handleCheckAllChange"
      ></el-checkbox>
    </div>
    <el-checkbox-group
      v-model="checkedData"
      @change="handleChange"
      v-bind="{ size: 'mini', ...$attrs }"
    >
      <el-row :gutter="10">
        <el-col
          :span="span"
          v-for="option in data"
          :key="option[valueKey]"
          style="margin-bottom: 5px"
        >
          <component
            :is="
              option.component ||
              (isCheckboxButton ? 'el-checkbox-button' : 'el-checkbox')
            "
            v-bind="{
              border,
              label: option[valueKey],
              disabled: option.disabled,
              ...(option.checkboxAttrs || {}),
            }"
          >
            <ws-tooltip
              :content="option[labelKey]"
              overflow
              placement="top-start"
            >
              <div class="el-checkbox-tooltip">
                {{ option[labelKey] }}
              </div>
            </ws-tooltip>
          </component>
        </el-col>
      </el-row>
    </el-checkbox-group>
  </div>
</template>

<script>
import { deepClone } from '../../utils/util'
import wsTooltip from '../../ws-tooltip'
import mixins from '../mixins'
export default {
  name: 'ws-checkbox-item',
  mixins: [mixins],
  components: {
    wsTooltip,
  },
  data() {
    return {
      checkedData: [],
    }
  },
  props: {
    // 复选框组名称
    name: {
      type: String,
      default: '',
    },
    // 是否可以全选
    allowCheckAll: {
      type: Boolean,
      default: false,
    },
    // 分割
    span: {
      default: 6,
      type: Number,
    },
    // 是否是按钮checkbox
    isCheckboxButton: {
      type: Boolean,
      default: false,
    },
    // 带有边框
    border: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    init() {
      this.checkedData = deepClone(this.value)
      this.judgeIsIndeterminate()
    },
    // 全选
    handleCheckAllChange(val) {
      const checkedData = val
        ? [...this.noChangeCheckedValue, ...this.changeValue]
        : [...this.noChangeCheckedValue]
      this.$emit('change', checkedData)
    },
    // 勾选
    handleChange() {
      this.$emit('change', this.checkedData)
    },
  },
}
</script>

<style lang="less" scoped>
.title {
  margin-right: 10px;
}

.inner-text {
  margin-bottom: 5px;
}
// 按钮复选框样式
/deep/ .is-disabled.is-checked .el-checkbox-button__inner {
  background-color: #409edd;
}

// 按钮复选框tooltip样式
/deep/ .el-checkbox-group .el-checkbox-button__inner,
.el-checkbox-group .el-checkbox-button {
  width: 100%;
}
.el-checkbox-tooltip {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 普通复选框tooltip样式
/deep/ .el-checkbox-group .el-checkbox {
  display: flex;
}
/deep/ .el-checkbox__label {
  min-width: 0;
}
</style>
