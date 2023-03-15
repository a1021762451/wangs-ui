<template>
  <div>
    <h3>只有文本溢出省略时，才加上tooltip提示框</h3>
    <div>
      <span style="margin-right: 20px">输入框</span>
      <el-input
        style="width: 200px; margin-right: 100px"
        v-model="str"
        placeholder="请输入"
        size="small"
        clearable
      ></el-input>
      <div style="display: flex; margin-top: 40px">
        <span style="margin-right: 20px">文本显示</span>
        <ws-tooltip :content="str" overflow>
          <div class="box">
            {{ str }}
          </div>
        </ws-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'test',
  data() {
    return {
      str: ''
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
