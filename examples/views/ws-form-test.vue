<template>
  <div>
    <ws-form
      :formConfigList="formConfigList"
      :buttonConfigList="buttonConfigList"
      :allOptions="allOptions"
      isSearchList
      @happenEvent="happenEvent"
      globalMinDate="2022-01-22"
      globalMaxDate="2024-01-22"
    >
     <!-- 指向ws-form组件的插槽 -->
      <template #lightOut="{ fieldItem, formData }">
        <el-input
          clearable
          v-model="formData[fieldItem.field]"
          :placeholder="fieldItem.disabled ? '' : '请输入内容'"
          :disabled="fieldItem.disabled"
        ></el-input>
      </template>
     <!-- 指向ws-buttons组件的插槽 -->
      <template #download="scope">
        <el-button
          type="primary"
          size="small"
          @click="happenEvent(scope)"
          >下载</el-button
        >
      </template>
    </ws-form>
  </div>
</template>

<script>
import {
  buttonConfigList,
  formConfigList,
  allOptions,
  happenEvent
} from '../contant'
export default {
  name: 'renderSearch-test',
  data() {
    return {
      buttonConfigList,
      formConfigList,
      allOptions
    }
  },
  methods: {
    happenEvent
  }
}
</script>

<style lang="less" scoped></style>
