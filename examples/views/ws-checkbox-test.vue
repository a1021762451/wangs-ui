<template>
  <div>
    <el-button type="primary" size="default" @click="getChecked(1)">getChecked(1)</el-button>
    <el-button type="primary" size="default" @click="getChecked(2)">getChecked(2)</el-button>
    <el-button type="primary" size="default" @click="getChecked(3)">getChecked(3)</el-button>
    <el-button type="primary" size="default" @click="getChecked(4)">getChecked(4)</el-button>
    <ws-checkbox
      allowControl
      selectAllMode="checkbox"
      :checkboxData="checkboxData"
      :span="6"
      ref="wsCheckbox"
    ></ws-checkbox>
  </div>
</template>

<script>
export default {
  name: 'ws-checkbox-test',
  data() {
    return {
      checkboxData: [
        {
          name: '一组',
          data: Array.from(new Array(20)).map((item, index) => {
            return {
              label: `一组${index}号`,
              id: `一组${index}号 - id`
            }
          }),
        },
        {
          name: '二组',
          data: Array.from(new Array(30)).map((item, index) => {
            return {
              label: `二组${index}号`,
              id: `二组${index}号 - id`
            }
          })
        },
      ]
    }
  },
  methods: {
    getChecked(type) {
      switch (type) {
        case 1:
          console.log(this.$refs.wsCheckbox.getAllCheckedIds());
          break;
        case 2:
          console.log(this.$refs.wsCheckbox.getAllCheckedItems());
          break;
        case 3:
          console.log(this.$refs.wsCheckbox.getAllCheckedIdsByGroup());
          break;
        case 4:
          console.log(this.$refs.wsCheckbox.getAllCheckedItemsByGroup());
          break;
        default:
          break;
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
