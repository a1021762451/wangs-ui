<template>
  <div class="check">
    <div class="check-left" :class="collapse ? 'collapse' : 'notcollapse'">
      <div
        class="check-item"
        v-for="item in options"
        :key="item.label"
        :class="{ 'check-item-active': value && value.includes(item.value) }"
        @click="change(item)"
      >
        {{ item.label }}
      </div>
    </div>
    <div class="check-right">
      <el-checkbox v-if="showCheckbox" v-model="checked" @change="checkedChange"
        >多选</el-checkbox
      >
      <el-link
        v-if="showCollapse"
        type="primary"
        :underline="false"
        @click="collapse = !collapse"
        style="margin-left: 10px"
        >{{ collapse ? '更多' : '收起' }}</el-link
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'check',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    // 绑定值
    value: {
      type: Array | String,
      default: () => [],
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
  },
  data() {
    return {
      // 复选框
      checked: false,
      // 折叠
      collapse: true,
    }
  },
  watch: {
    value: {
      handler(newVaue) {
        this.dispatch('ElFormItem', 'el.form.change', [newVaue])
      },
    },
  },
  methods: {
    // 多选按钮框改变
    checkedChange() {
      console.log('checkedChange')
    },
    // 选项改变
    change(item) {
      const { value = [] } = item
      const index = this.value.indexOf(value)
      const newVaue = [...this.value]
      if (index === -1) {
        if (this.checked) {
          newVaue.push(value)
        } else {
          newVaue.splice(0, newVaue.length, value)
        }
      } else {
        newVaue.splice(index, 1)
      }
      this.$emit('change', newVaue)
      // this.dispatch('ElFormItem', 'el.form.change', [newVaue])
    },
    // 事件派发
    dispatch(componentName, eventName, params) {
      // @param 1: 触发事件的组件名称 2: 事件名称 3. 额外参数
      var parent = this.$parent || this.$root
      var name = parent.$options.componentName
      while (parent && (!name || name !== componentName)) {
        // 根据componentName自下而上递归查找目标组件
        parent = parent.$parent
        if (parent) {
          name = parent.$options.componentName
        }
      }
      if (parent) {
        // 用名称为[componentName]的组件$emit事件
        parent.$emit.apply(parent, [eventName].concat(params))
      }
    },
  },
}
</script>

<style lang="less" scoped>
.check {
  line-height: initial;
  display: flex;
  font-size: 12px;
  // align-items: center;
  .check-left {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    .check-item {
      padding: 2px 5px;
      border: 1px solid #ccc;
      cursor: pointer;
      margin-right: 10px;
      margin-bottom: 4px;
      &.check-item-active {
        background-color: #05a994;
        color: #fff;
      }
    }
  }
  .check-left.collapse {
    max-height: 24px;
    overflow: hidden;
  }
  .check-left.notcollapse {
    max-height: 100px;
    overflow: auto;
    // border: 1px solid #ccc;
    // border-left: none;
    // border-right: none;
  }
  .check-right {
    margin-left: 20px;
    display: flex;
    align-items: flex-start;
  }
}
/deep/ .el-checkbox__label {
  padding-left: 2px;
  line-height: initial;
}
</style>
