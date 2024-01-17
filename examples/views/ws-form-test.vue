<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-16 09:03:42
 * @LastEditors: wang shuai
 * @LastEditTime: 2024-01-09 14:45:06
-->
<template>
  <div>
    <ws-form
      label-suffix=":"
      :formConfigList="formConfigList"
      :buttonConfigList="formButtons"
      :allOptions="allOptions"
      :isSearchList="false"
      @happenEvent="happenEvent"
      :formData.sync="formData"
      :extraComponents="extraComponents"
      ref="wsForm"
    >
      <!-- 指向ws-form组件的插槽 -->
      <template #testSlot="{ fieldItem, formData }">
        <el-input
          clearable
          v-model="formData[fieldItem.prop]"
          :placeholder="fieldItem.disabled ? '' : '请输入内容'"
          :disabled="fieldItem.disabled"
        ></el-input>
      </template>
      <!-- 指向ws-buttons组件的插槽 -->
      <template #download="scope">
        <el-button type="primary" size="small" @click="happenEvent(scope)"
          >下载</el-button
        >
      </template>
    </ws-form>
  </div>
</template>

<script>
import {
  formButtons,
  formConfigList,
  allOptions,
  happenEvent,
} from '../contant'
export default {
  name: 'renderSearch-test',
  data() {
    return {
      formButtons,
      formConfigList,
      allOptions,
      formData: {},
      extraComponents: {
        'ws-select': () => import('@/ws-select'),
      },
    }
  },
  methods: {
    happenEvent,
  },
}
</script>

<style lang="less" scoped></style>
