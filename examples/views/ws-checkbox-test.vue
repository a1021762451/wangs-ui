<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-10 10:25:35
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-07-25 14:38:56
-->
<template>
  <ws-checkbox
    ref="wsCheckbox"
    selectAllMode="checkbox"
    v-model="defaultCheckedData"
    @change="change"
    @indeterminateChange="indeterminateChange"
    :data="checkboxData"
    :span="6"
    :props="{
      label: 'label',
      value: 'id',
    }"
  ></ws-checkbox>
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
          allowCheckAll: true
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
          allowCheckAll: true
        },
      ],
      defaultCheckedData: [
        '一组3号 - id',
        '一组4号 - id',
        '一组10号 - id',
        '一组15号 - id',
        '二组3号 - id',
        '二组4号 - id',
        '二组10号 - id',
        '二组15号 - id',
      ],
    }
  },
  methods: {
    change(val) {
      console.log(val, 'change')
    },
    indeterminateChange(val) {
      console.log(val, 'indeterminateChange')
    },
  },
}
</script>

<style lang="scss" scoped></style>
