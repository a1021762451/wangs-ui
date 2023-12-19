<template>
  <div id="app">
    <el-menu
      :default-active="defaultActive"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      router
    >
      <el-menu-item :index="item.path" v-for="item in routes" :key="item.path">{{
        item.name
      }}</el-menu-item>
    </el-menu>
    <div class="router-container">
      <router-view />
    </div>
  </div>
</template>
<script>
import { routes } from './router/index'
export default {
  data() {
    return {
      defaultActive: '',
      routes: routes.slice(1),
    }
  },
  watch: {
    $route: {
      handler() {
        this.defaultActive = this.$route.path
        console.log(this.$route.path, this.defaultActive, 'this.def');
      }
    },
    immediate: true,
  },
}
</script>
<style lang="less">
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .router-container {
    flex: 1;
    min-height: 0;
    padding: 20px;
  }
}
</style>
