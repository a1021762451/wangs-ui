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
        ></el-checkbox>
      </div>
      <el-checkbox-group v-model="checkedData" @change="handleCheckedChange">
        <el-row :gutter="10">
          <el-col :span="span" v-for="option in data" :key="option[valueField]">
            <el-checkbox-button
              v-if="isCheckboxButton"
              :disabled="option.disabled"
              :border="border"
              :label="option[valueField]"
            >
              <ws-tooltip
                :content="option[labelField]"
                overflow
                placement="top-start"
              >
                <div class="el-checkbox-tooltip">
                  {{ option[labelField] }}
                </div>
              </ws-tooltip>
            </el-checkbox-button>

            <ws-tooltip
              :content="option[labelField]"
              overflow
              placement="top-start"
              v-else
            >
              <el-checkbox
                :disabled="option.disabled"
                :border="border"
                :label="option[valueField]"
              >
                {{ option[labelField] }}
              </el-checkbox>
            </ws-tooltip>
          </el-col>
        </el-row>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script>
import { deepClone } from '../../utils/util'
import wsTooltip from '../../ws-tooltip'
export default {
  name: 'ws-checkbox-item',
  components: {
    wsTooltip,
  },
  data() {
    return {
      checkAll: false,
      isIndeterminate: false,
      checkedData: [],
    }
  },
  props: {
    // 默认被勾选的数据
    defaultCheckedData: {
      type: Array,
      default() {
        return []
      },
    },
    // 复选框组名称
    name: {
      type: String,
      default: '',
    },
    // 是否可以全选
    allowControl: {
      type: Boolean,
      default: false,
    },
    // 总的数据
    data: {
      type: Array,
      default() {
        return []
      },
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
    // label和value字段在数据中的映射字段
    props: {
      default() {
        return {
          label: 'label',
          value: 'value',
        }
      },
    },
    // 不允许变更的已勾选数据
    noChangeCheckedValues: {
      default() {
        return []
      },
      type: Array,
    },
    // 不允许变更的未勾选数据
    noChangeNoCheckedValues: {
      default() {
        return []
      },
      type: Array,
    },
    // 允许变更的数据
    allowChangeValues: {
      default() {
        return []
      },
      type: Array,
    },
  },
  watch: {
    // 根据被勾选的数据判断
    defaultCheckedData() {
      this.init()
    },
  },
  computed: {
    allId() {
      return this.data.map((item) => item[this.valueField])
    },
    labelField() {
      return this.props.label
    },
    valueField() {
      return this.props.value
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      const arr = this.judgeArrayContain(
        deepClone(this.defaultCheckedData),
        this.allId
      )
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
      // const checkedData = val ? deepClone(this.allId) : []
      // const notCheckedData = val ? [] : deepClone(this.allId)
      const checkedData = val
        ? [...this.noChangeCheckedValues, ...this.allowChangeValues]
        : this.noChangeCheckedValues
      const notCheckedData = val
        ? this.noChangeNoCheckedValues
        : [...this.noChangeNoCheckedValues, ...this.allowChangeValues]
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

/deep/ .el-checkbox-group .el-checkbox {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
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
/deep/ .el-checkbox__label {
  display: inline;
}
</style>
