<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-04-20 11:56:21
 * @LastEditors: wang shuai
 * @LastEditTime: 2025-04-22 16:37:35
-->
<template>
  <div class="ws-fold-test">
    <!-- <div class="ws-fold-test-other">占位</div> -->
    <ws-fold
      class="ws-fold"
      @collapse="collapse"
      isPercent
      :minwidth="10"
      :maxwidth="60"
      :defaultWidth="30"
      direction="left"
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
    <div class="ws-fold-test-other">占位</div>
  </div>
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

<style lang="less" scoped>
.ws-fold-test {
  display: flex;
  height: 100%;
  .ws-fold-test-other {
    flex: 1;
    min-width: 0;
    font-weight: bold;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .ws-fold {
    height: 100%;
  }
}
</style>
