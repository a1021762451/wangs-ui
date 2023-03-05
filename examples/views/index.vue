<template>
  <div>
    <el-button
      type="primary"
      v-for="item in comTestList"
      :key="item.name"
      @click="$router.push(item.path)"
      >{{ item.name }}</el-button
    >
  </div>
</template>
<script>
import { list } from '../contant';
export default {
  name: 'index',
  data() {
    return {};
  },
  created() {
    this.comTestList = list.map((item) => {
      return {
        name: item,
        path: '/' + item,
      };
    });
  },
};
</script>
<style lang="less"></style>
