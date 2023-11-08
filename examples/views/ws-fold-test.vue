<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-04-20 11:56:21
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-11-06 16:04:04
-->
<template>
  <ws-fold>
    <div>test</div>
    <!-- <template v-slot:collapse="{ collapsed }">
       <div>test{{ collapsed }}</div>
    </template> -->
    <template v-slot:collapseIcon="{ collapsed }">
      <i class="el-icon-edit" v-if="collapsed"></i>
      <i class="el-icon-share" v-else></i>
    </template>
  </ws-fold>
</template>

<script>
export default {
  name: 'ws-fold-test',
}
</script>

<style lang="less" scoped></style>
