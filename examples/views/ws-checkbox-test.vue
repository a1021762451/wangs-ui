<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-10 10:25:35
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-03-22 10:44:01
-->
<template>
  <div>
    <el-button type="primary" size="default" @click="getChecked(1)"
      >getChecked(1)</el-button
    >
    <el-button type="primary" size="default" @click="getChecked(2)"
      >getChecked(2)</el-button
    >
    <el-button type="primary" size="default" @click="getChecked(3)"
      >getChecked(3)</el-button
    >
    <el-button type="primary" size="default" @click="getChecked(4)"
      >getChecked(4)</el-button
    >
    <ws-checkbox
      allowControl
      selectAllMode="checkbox"
      :defaultCheckedData="defaultCheckedData"
      :checkboxData="checkboxData"
      :span="6"
      ref="wsCheckbox"
      :props="{
        label: 'label',
        value: 'id',
      }"
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
              id: `一组${index}号 - id`,
              disabled: index % 2 === 0,
            }
          }),
        },
        {
          name: '二组',
          data: Array.from(new Array(30)).map((item, index) => {
            return {
              label: `二组${index}号`,
              id: `二组${index}号 - id`,
              disabled: index % 2 === 1,
            }
          }),
        },
      ],
      defaultCheckedData: ['一组3号 - id', '一组4号 - id', '一组10号 - id','一组15号 - id', '二组3号 - id', '二组4号 - id', '二组10号 - id','二组15号 - id'],
    }
  },
  methods: {
    getChecked(type) {
      switch (type) {
        case 1:
          console.log(this.$refs.wsCheckbox.getAllCheckedValues())
          break
        case 2:
          console.log(this.$refs.wsCheckbox.getAllCheckedItems())
          break
        case 3:
          console.log(this.$refs.wsCheckbox.getAllCheckedValuesByGroup())
          break
        case 4:
          console.log(this.$refs.wsCheckbox.getAllCheckedItemsByGroup())
          break
        default:
          break
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
