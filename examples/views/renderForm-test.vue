<template>
  <div>
    <renderForm
      :formConfigList="formConfigList"
      :buttonConfigList="buttonConfigList"
      :allOptions="allOptions"
      isSearchList
      @happenEvent="happenEvent"
    >
     <!-- 指向renderForm组件的插槽 -->
      <template #lightOut="{ fieldItem, formData }">
        <el-input
          clearable
          v-model="formData[fieldItem.field]"
          :placeholder="fieldItem.disabled ? '' : '请输入内容'"
          :disabled="fieldItem.disabled"
        ></el-input>
      </template>
     <!-- 指向renderButtons组件的插槽 -->
      <template #download="scope">
        <el-button
          type="primary"
          size="small"
          @click="happenEvent(scope)"
          >下载</el-button
        >
      </template>
    </renderForm>
  </div>
</template>

<script>
import {
  buttonConfigList,
  formConfigList,
  allOptions,
  happenEvent
} from '../contant'
import renderButtons from '@/componentes/renderButtons'
export default {
  name: 'renderSearch-test',
  components: { renderButtons },
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
