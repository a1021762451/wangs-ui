<template>
  <div>
    <renderForm
      :formConfigList="formConfigList"
      :buttonConfigList="buttonConfigList"
      :allOptions="allOptions"
      isSearchList
      @happenEvent="happenEvent"
      style="margin-bottom: 20px"
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
        <el-button type="primary" size="small" @click="happenEvent(scope)"
          >下载</el-button
        >
      </template>
    </renderForm>
    <renderTable
      style="height: 450px"
      :loading="loading"
      :tableData="tableData"
      :tableColumns="tableColumns"
      :tableButtons="tableButtons"
      globalMinDate="2022-01-22"
      globalMaxDate="2024-01-22"
      @happenEvent="happenEvent"
      @selection-change="selectionChange"
      ref="renderTable"
    >
      <template v-slot:expand="{ row }">
        <div>
          {{ JSON.stringify(row) }}
        </div>
      </template>
    </renderTable>
  </div>
</template>

<script>
import {
  buttonConfigList,
  formConfigList,
  allOptions,
  tableColumns,
  tableButtons,
  happenEvent
} from '../contant'
export default {
  name: 'renderTable-test',
  data() {
    return {
      buttonConfigList,
      formConfigList,
      allOptions,
      tableColumns,
      tableButtons,
      selection: [],
      tableData: [
        {
          plantName: '一号机组',
          testInput: '1',
          widthAdjust: '宽度宽度宽度',
          testCheckBox: '0',
          testSelect: '苹果',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: ''
        },
        {
          plantName: '二号机组',
          testInput: '2',
          widthAdjust: '宽度宽度宽度',
          testSelect: '香蕉',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: ''
        }
      ],
      loading: false
    }
  },
  mounted() {
    setTimeout(() => {
      this.tableData.push({
        plantName: '四号机组',
        testInput: '3',
        widthAdjust: '宽度宽度宽度宽度宽度宽度',
        testSelect: '',
        testMinDatetime: '',
        testMaxDatetime: '',
        testTime: ''
      })
    }, '1000')
  },
  methods: {
    happenEvent,
    // 勾选操作
    selectionChange(selection) {
      this.selection = selection
    }
  }
}
</script>

<style lang="less" scoped></style>
