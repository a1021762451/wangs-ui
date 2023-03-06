<template>
  <div style="margin-bottom: 10px">
    <div>
      <div :span="24" v-if="name" class="inner-text">
        <span class="title">
          {{ name }}
        </span>
        <el-checkbox
          v-if="allowControl"
          :indeterminate="isIndeterminate"
          v-model="checkAll"
          @change="handleCheckAllChange"
          :disabled="disabled"
        ></el-checkbox>
      </div>
      <el-checkbox-group v-model="checkedData" @change="handleCheckedChange">
        <el-row :gutter="20">
          <el-col :span="span" v-for="option in data" :key="option.id">
            <el-checkbox-button
              v-if="isCheckboxButton"
              :disabled="option.disabled"
              :border="border"
              :label="option.id"
              >{{ option.label }}</el-checkbox-button
            >

            <el-checkbox
              v-else
              :disabled="option.disabled"
              :border="border"
              :label="option.id"
              >{{ option.label }}</el-checkbox
            >
          </el-col>
        </el-row>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script>
import { deepClone } from '../../utils/util'
export default {
  name: 'ws-checkbox-item',
  data() {
    return {
      checkAll: false,
      isIndeterminate: false,
      checkedData: []
    }
  },
  props: {
    // 默认被勾选的数据
    defaultCheckedData: {
      type: Array,
      default() {
        return []
      }
    },
    // 复选框组名称
    name: {
      type: String,
      default: ''
    },
    // 是否可以全选
    allowControl: {
      type: Boolean,
      default: false
    },
    // 总的数据
    data: {
      type: Array,
      default() {
        return []
      }
    },
    // 分割
    span: {
      default: 6,
      type: Number
    },
    // 全选禁用：
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否是按钮checkbox
    isCheckboxButton: {
      type: Boolean,
      default: false
    },
    // 带有边框
    border: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    // 根据被勾选的数据判断
    defaultCheckedData() {
      this.init()
    }
  },
  computed: {
    allId() {
      return this.data.map((item) => item.id)
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      const arr = this.judgeArrayContain(this.defaultCheckedData, this.allId)
      this.checkedData = arr
      this.judgeIsIndeterminate()
    },
    // 判断全选状态
    judgeIsIndeterminate() {
      let checkedCount = this.checkedData.length
      this.checkAll = checkedCount === this.allId.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.allId.length
    },
    // 全选
    handleCheckAllChange(val) {
      const checkedData = val ? deepClone(this.allId) : []
      const notCheckedData = val ? [] : deepClone(this.allId)
      this.$emit('change', checkedData, notCheckedData)
      this.checkedData = checkedData
      this.isIndeterminate = false
    },
    // 勾选
    handleCheckedChange(val) {
      const checkedData = val
      const notCheckedData = this.allId.filter((id) => {
        return !val.includes(id)
      })
      this.judgeIsIndeterminate()
      this.$emit('change', checkedData, notCheckedData)
    },
    // 判断数组包含关系
    judgeArrayContain(father, son) {
      const arr = father.filter((item) => {
        return son.includes(item)
      })
      return arr
    }
  }
}
</script>

<style lang="less" scoped>
.title {
  margin-right: 10px;
}

.inner-text {
  margin-bottom: 5px;
}
</style>
