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
      style="margin-bottom: 10px"
      ref="wsForm"
    >
      <!-- 指向ws-form组件的插槽 -->
      <template #lightOut="{ fieldItem, formData }">
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
    <ws-table
      style="height: 450px"
      :loading="loading"
      :tableData="tableData"
      :tableColumns="tableColumns"
      :tableButtons="tableButtons"
      :allOptions="allOptions"
      :utilsList="['setColumms']"
      :header-cell-style="{ background: '#f3f3f3' }"
      @happenEvent="happenEvent"
      @selection-change="selectionChange"
      ref="wsTable"
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
          {{ row.plantName + '--插槽' + fieldItem.prop }}
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
          testFormatter: '内容内容内容内容',
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
          work: '程序员',
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
        },
      ],
      loading: false,
      formData: {},
      pageInfo: {},
    }
  },
  mounted() {
    this.getInitParams()
    setTimeout(() => {
      this.tableData.push({
        plantName: '四号机组',
        testInput: '3',
        widthAdjust: '宽度宽度宽度宽度宽度宽度',
        testSelect: '',
        testMinDatetime: '',
        testMaxDatetime: '',
        testTime: '',
        testFormatter: '内容',
      })
    }, '1000')
  },
  methods: {
    // 获取初始化的参数
    getInitParams() {
      const wsForm = this.$refs.wsForm
      const wsTable = this.$refs.wsTable
      const formData = wsForm.formData
      const pageInfo = wsTable.pageInfo
      this.formData = formData
      this.pageInfo = pageInfo
    },
    // 触发事件
    happenEvent(eventData) {
      console.log(eventData, 'eventData')
      const { method } = eventData
      this[method] && this[method](eventData)
    },
    // 勾选操作
    selectionChange(selection) {
      this.selection = selection
    },
  },
}
</script>

<style lang="less" scoped></style>
