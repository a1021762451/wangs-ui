<!--
 * @Author: wanns 1021762451@qq.com
 * @Date: 2023-03-15 19:36:28
 * @LastEditors: wanns 1021762451@qq.com
 * @LastEditTime: 2023-03-15 22:44:50
 * @FilePath: \ws-ui\examples\views\test.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <el-time-picker
      v-model="value"
      :picker-options="{
        selectableRange: '09:30:50 - 23:00:00',
      }"
      value-format="HH:mm:ss"
      format="HH:mm:ss"
      placeholder="任意时间点"
    >
    </el-time-picker>
    <el-time-select
      v-model="value"
      :picker-options="{
        minTime: 0,
        maxTime: 0,
      }"
      placeholder="选择时间"
    >
    </el-time-select>
  </div>
</template>

<script>
export default {
  name: "test",
  data() {
    return {
      value: "",
    };
  },
};
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
