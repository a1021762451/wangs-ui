<template>
  <div class="check" ref="check" v-resize.window.immediate="judgeOneRow">
    <div
      class="check-left"
      :class="{ isFold }"
      :style="{ height: isFold ? colHeight + 'px' : '100px' }"
    >
      <!-- 复选框 和 单选框-->
      <component
        :is="component"
        v-model="ownValue"
        @change="checkChange"
        v-bind="$attrs"
      >
        <component
          class="check-item"
          :is="subCompnent"
          v-for="item in options"
          :key="item.value"
          v-bind="{
            ...item,
            label: item.value,
          }"
        >
          {{ item.label }}
        </component>
      </component>
    </div>
    <div class="check-right">
      <el-checkbox
        v-if="showCheckbox"
        v-model="component"
        true-label="el-checkbox-group"
        false-label="el-radio-group"
        @change="componentChange"
        >多选</el-checkbox
      >
      <el-link
        v-if="showCollapse && allowCollapse"
        type="primary"
        :underline="false"
        @click="changeFold"
        style="margin-left: 10px"
        >{{ isFold ? '更多' : '收起' }}</el-link
      >
    </div>
  </div>
</template>

<script>
import { dispatch, vResize } from '../../utils/util'
export default {
  name: 'check',
  model: {
    prop: 'value',
    event: 'change',
  },
  directives: {
    resize: vResize,
  },
  props: {
    value: {
      type: Array | String | Number,
      default: '',
    },
    // 是否显示多选按钮框
    showCheckbox: {
      type: Boolean,
      default: true,
    },
    // 是否显示折叠按钮
    showCollapse: {
      type: Boolean,
      default: true,
    },
    // 选项数据
    options: {
      type: Array,
      default: () => [],
    },
    // 是否是按钮样式
    isButton: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      // 折叠
      isFold: true,
      component: 'el-radio-group',
      test: [],
      ownValue: '',
      colHeight: 0,
      allowCollapse: false,
    }
  },
  computed: {
    subCompnent() {
      return this.component === 'el-checkbox-group'
        ? this.isButton
          ? 'el-checkbox-button'
          : 'el-checkbox'
        : this.isButton
        ? 'el-radio-button'
        : 'el-radio'
    },
    checked() {
      return this.component === 'el-checkbox-group'
    },
  },
  watch: {
    value: {
      handler(newVaue) {
        this.ownValue = this.getOwnValue()
        this.dispatch('ElFormItem', 'el.form.change', [newVaue])
      },
      immediate: true,
    },
    options: {
      handler() {
        this.judgeOneRow()
      },
    },
  },
  mounted() {
    // 不要折叠
    this.isFold = this.showCollapse
  },
  methods: {
    // 事件派发
    dispatch,
    // 折叠变更
    async changeFold() {
      // 如果折叠起来滚动到顶部
      if (!this.isFold) {
        const el = this.$refs.check
        const checkLeft = el.querySelector('.check-left')
        checkLeft.scrollTop = 0
      }
      await this.$nextTick()
      this.isFold = !this.isFold
    },
    // 获取单行高度通过check-item
    judgeOneRow() {
      const el = this.$refs.check
      if (!el) return
      let checkItemEl = el.querySelector('.check-item')
      this.colHeight = checkItemEl.offsetHeight
      this.$nextTick(() => {
        const checkLeft = el.querySelector('.check-left')
        // 判断是否需要滚动
        this.allowCollapse = checkLeft.scrollHeight > checkLeft.clientHeight
      })
    },
    // 通过value获取组件值，字符串或者数组
    getOwnValue() {
      if (this.checked) {
        return this.value
      } else {
        return this.value[0] !== undefined ? this.value[0] : ''
      }
    },
    // 通过组件值获取value，数组
    getValue() {
      if (this.checked) {
        return this.ownValue
      } else {
        return this.ownValue !== '' ? [this.ownValue] : []
      }
    },
    // 处理change事件
    checkChange() {
      const newValue = this.getValue()
      this.$emit('change', newValue)
    },
    // 单选多选切换
    componentChange() {
      let newValue = this.value
      const valueExist = this.value.length
      // 多选切换单选，如果有值，取第一个
      if (!this.checked && valueExist) {
        newValue = [this.value[0]]
      }
      console.log('newValue----------', newValue)
      this.$emit('change', [...newValue])
    },
  },
}
</script>

<style lang="less" scoped>
.check {
  // line-height: initial;
  display: flex;
  font-size: 12px;
  // align-items: center;
  .check-left {
    flex: 1;
    overflow: auto;
    .check-cusitem {
      padding: 2px 5px;
      border: 1px solid #ccc;
      cursor: pointer;
      margin-right: 10px;
      margin-bottom: 4px;
    }
    .check-cusitem-active {
      background-color: #05a994;
      color: #fff;
    }
  }
  .check-left.isFold {
    overflow: hidden;
  }
  .check-right {
    margin-left: 20px;
    display: flex;
    align-items: flex-start;
  }
}
/deep/ .el-radio-group {
  line-height: inherit;
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  .el-radio {
    line-height: inherit;
    .el-radio__label {
      padding-left: 0px;
    }
  }
  .el-radio-button__inner {
    border: 0px;
    padding: 5px 8px;
    margin-right: 4px;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    border-radius: 2px;
  }
}
/deep/ .el-checkbox-group {
  line-height: inherit;
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  .el-checkbox {
    line-height: inherit;
    .el-radio__label {
      padding-left: 0px;
    }
    .el-checkbox__label {
      padding-left: 4px;
    }
  }
  .el-checkbox-button__inner {
    border: 0px;
    padding: 5px 8px;
    margin-right: 4px;
  }
  .el-checkbox-button.is-checked .el-checkbox-button__inner {
    border-radius: 2px;
  }
}
</style>
