<template>
  <div>
    <ws-form
      :formConfigList="formConfigList"
      :buttonConfigList="buttonConfigList"
      :allOptions="allOptions"
      :defaultForm="defaultForm"
      buttonSize="small"
      isSearchList
      @happenEvent="happenEvent"
      style="margin-bottom: 20px"
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
        <el-button type="primary" size="small" @click="happenEvent(scope)"
          >下载</el-button
        >
      </template>
    </ws-form>
    <ws-table
      style="height: 450px"
      :loading="loading"
      :tableData="tableData"
      :tableColumns="tableColumns"
      :tableButtons="tableButtons"
      globalMinDate="2022-01-22"
      globalMaxDate="2024-01-22"
      @happenEvent="happenEvent"
      @selection-change="selectionChange"
      ref="ws-table"
    >
      <template v-slot:expand="{ row }">
        <div>
          {{ JSON.stringify(row) }}
        </div>
      </template>
      <template v-slot:plantName_header="{ column }">
        <div>
          {{ column.label + '--插槽' }}
        </div>
      </template>
      <template v-slot:plantName="{ row, fieldItem }">
        <div>
          {{ row.plantName + '--插槽' + fieldItem.field }}
        </div>
      </template>
    </ws-table>
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
  name: 'ws-table-test',
  data() {
    return {
      buttonConfigList,
      formConfigList,
      allOptions,
      tableColumns,
      tableButtons,
      defaultForm: { applyComId: '南昌', equipName: '4号' },
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
          testTime: '',
          testFormatter: '内容',
          name: '王',
          age: 18,
        },
        {
          plantName: '二号机组',
          testInput: '2',
          widthAdjust: '宽度宽度宽度',
          testSelect: '香蕉',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: '',
          testFormatter: '内容',
          adress: '北京',
          work: '程序员'
        },
        {
          plantName: '二号机组',
          testInput: '2',
          widthAdjust: '宽度宽度宽度',
          testSelect: '香蕉',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: '',
          testFormatter: '内容'
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
        testTime: '',
        testFormatter: '内容'
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
