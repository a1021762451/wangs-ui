<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-16 09:03:42
 * @LastEditors: wang shuai
 * @LastEditTime: 2025-01-09 18:02:08
-->
<template>
  <div>
    <ws-form
      label-suffix=":"
      :formConfigList="formConfigList"
      :buttonConfigList="formButtons"
      :useDefaultButtons="true"
      :allOptions="allOptions"
      formStyle="search"
      @happenEvent="happenEvent"
      :formData.sync="formData"
      :extraComponents="extraComponents"
      collapsible
      accordion
      ref="wsForm"
    >
      <!-- 指向ws-form组件的插槽 -->
      <template #testSlot="{ fieldItem, formData, fieldItemChange }">
        <el-input
          clearable
          v-model="formData[fieldItem.prop]"
          :placeholder="fieldItem.disabled ? '' : '请输入内容'"
          :disabled="fieldItem.disabled"
          @change="fieldItemChange(fieldItem, formData)"
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
