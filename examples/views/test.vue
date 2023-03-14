<template>
  <div>
    <el-button @click="toggleStr" type="primary" style="margin-bottom: 20px">切换文字长度</el-button>
    <ws-tooltip :content="flag ? overStr :str" overflow>
      <div class="box">
        {{ flag ? overStr :str  }}
      </div>
    </ws-tooltip>
  </div>
</template>

<script>
export default {
  name: 'test',
  data() {
    return {
      str: '文字正常长度',
      overStr: '文字超出文字超出文字超出文字超出文字超出文字超出',
      flag: false
    }
  },
  methods: {
    toggleStr() {
      this.flag = !this.flag
      this.str =
        this.str === '文字正常长度'
          ? '文字超出文字超出文字超出文字超出文字超出文字超出'
          : '文字正常'
    }
  }
}
</script>

<style lang="less" scoped>
.box {
  width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
