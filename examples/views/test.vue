<template>
  <el-time-picker
    v-model="value"
    :picker-options="{
      selectableRange: '09:30:00 - 12:00:00'
    }"
    value-format="HH:mm"
    format="HH:mm"
    placeholder="任意时间点"
  >
  </el-time-picker>
</template>

<script>
export default {
  name: 'test',
  data() {
    return {
      value: ''
    }
  }
}
</script>

<style lang="less" scoped>
.box {
  // border: 1px solid red;
  background: red;
  height: 30px;
  width: 100px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
