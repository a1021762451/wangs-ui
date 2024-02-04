<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-04-20 11:56:21
 * @LastEditors: wang shuai
 * @LastEditTime: 2024-02-04 12:23:07
-->
<template>
  <ws-fold
    @collapse="collapse"
    isPercent
    :minwidth="10"
    :maxwidth="60"
    :defaultWidth="30"
  >
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
  methods: {
    collapse(collapsed) {
      console.log(collapsed, 'collapsed')
    },
  },
}
</script>

<style lang="less" scoped></style>
